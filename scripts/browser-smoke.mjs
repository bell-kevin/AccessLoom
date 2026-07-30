import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const host = "127.0.0.1";
const appPort = 4173;
const debugPort = 9333;
const appUrl = `http://${host}:${appPort}`;
const artifactDirectory = resolve(".artifacts");
const profileDirectory = mkdtempSync(resolve(tmpdir(), "accessloom-smoke-"));
const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
];

const edgePath = edgeCandidates.find(existsSync);
if (!edgePath) {
  throw new Error("A Chromium-family browser was not found for the smoke test.");
}

mkdirSync(artifactDirectory, { recursive: true });

const delay = (milliseconds) =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function waitForHttp(url, timeout = 15_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // The process may still be starting.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class DevToolsClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.sequence = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    await new Promise((resolvePromise, rejectPromise) => {
      this.socket.addEventListener("open", resolvePromise, { once: true });
      this.socket.addEventListener("error", rejectPromise, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      for (const listener of this.listeners.get(message.method) ?? []) {
        listener(message.params);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.sequence;
    return new Promise((resolvePromise, rejectPromise) => {
      this.pending.set(id, { resolve: resolvePromise, reject: rejectPromise });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text);
  }
  return response.result.value;
}

async function waitFor(client, expression, description, timeout = 10_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (await evaluate(client, expression)) return;
    await delay(100);
  }
  const state = await evaluate(
    client,
    `({
      url: location.href,
      title: document.title,
      readyState: document.readyState,
      body: document.body?.innerText.slice(0, 240),
      root: document.querySelector("#root")?.innerHTML.slice(0, 240),
      scripts: [...document.scripts].map((script) => script.src),
      dialog: document.querySelector("dialog[open]")?.innerText.slice(0, 400),
      activeElement: document.activeElement?.outerHTML.slice(0, 240)
    })`
  );
  throw new Error(
    `Timed out waiting for ${description}. Browser state: ${JSON.stringify(state)}. ` +
      `Browser errors: ${JSON.stringify(runtimeErrors)}`
  );
}

async function saveScreenshot(client, filename) {
  const response = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  writeFileSync(resolve(artifactDirectory, filename), response.data, "base64");
}

const preview = spawn(
  process.execPath,
  [
    resolve("node_modules/vite/bin/vite.js"),
    "preview",
    "--host",
    host,
    "--port",
    String(appPort),
    "--strictPort"
  ],
  { stdio: "ignore", windowsHide: true }
);

let browser;
let client;
const runtimeErrors = [];

try {
  await waitForHttp(appUrl);
  browser = spawn(
    edgePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDirectory}`,
      "about:blank"
    ],
    { stdio: "ignore", windowsHide: true }
  );

  await waitForHttp(`http://${host}:${debugPort}/json/version`);
  const targetResponse = await fetch(
    `http://${host}:${debugPort}/json/new?${encodeURIComponent(appUrl)}`,
    { method: "PUT" }
  );
  const target = await targetResponse.json();
  client = new DevToolsClient(target.webSocketDebuggerUrl);
  await client.connect();
  client.on("Runtime.exceptionThrown", (entry) => {
    const details = entry.exceptionDetails;
    runtimeErrors.push(
      JSON.stringify({
        text: details?.text,
        exception: details?.exception,
        url: details?.url,
        lineNumber: details?.lineNumber,
        columnNumber: details?.columnNumber,
        stackTrace: details?.stackTrace
      })
    );
  });
  client.on("Log.entryAdded", (entry) => {
    if (entry.entry?.level === "error") runtimeErrors.push(entry.entry.text);
  });

  await Promise.all([
    client.send("Page.enable"),
    client.send("Runtime.enable"),
    client.send("Log.enable"),
    client.send("Accessibility.enable"),
    client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false
    })
  ]);
  await client.send("Page.reload", { ignoreCache: true });

  await waitFor(
    client,
    `document.body?.innerText.includes("Work should fit") &&
      document.body?.innerText.includes("humans.")`,
    "the welcome screen"
  );
  const privacyPromise = await evaluate(
    client,
    `document.body.innerText.includes("No automatic workspace upload")`
  );
  if (!privacyPromise) throw new Error("The welcome privacy promise is missing.");
  await delay(750);
  await saveScreenshot(client, "welcome-desktop.png");

  const clickedDemo = await evaluate(
    client,
    `(() => {
      const button = [...document.querySelectorAll("button")]
        .find((item) => item.textContent.includes("Explore the live demo"));
      button?.click();
      return Boolean(button);
    })()`
  );
  if (!clickedDemo) throw new Error("Could not activate the demo workspace.");
  await waitFor(
    client,
    `document.body.innerText.includes("fictional workspace")`,
    "the demo dashboard"
  );
  await saveScreenshot(client, "dashboard-desktop.png");

  const viewChecks = [
    ["patterns", "Your patterns, in context."],
    ["supports", "The support lab."],
    ["passport", "Your access passport."],
    ["today", "Notice the fit, not your worth."]
  ];
  for (const [view, expectedText] of viewChecks) {
    await evaluate(client, `location.hash = "#/${view}"`);
    await waitFor(
      client,
      `document.body.innerText.includes(${JSON.stringify(expectedText)})`,
      `${view} view`
    );
    if (view === "patterns" || view === "supports" || view === "passport") {
      await delay(250);
      await saveScreenshot(client, `${view}-desktop.png`);
    }
    if (view === "supports") {
      await evaluate(
        client,
        `document.querySelector("#follow-heading")?.scrollIntoView({ block: "start" })`
      );
      await delay(250);
      await saveScreenshot(client, "ledger-desktop.png");
      await evaluate(client, `scrollTo({ top: 0 })`);
    }
  }

  const openedCheckIn = await evaluate(
    client,
    `(() => {
      const button = [...document.querySelectorAll("button")]
        .find((item) => item.textContent.includes("New check-in"));
      button?.click();
      return Boolean(button);
    })()`
  );
  if (!openedCheckIn) throw new Error("Could not open the check-in flow.");
  await waitFor(client, `Boolean(document.querySelector("dialog[open]"))`, "check-in dialog");
  const closedCheckIn = await evaluate(
    client,
    `(() => {
      const button = document.querySelector('dialog[open] button[aria-label="Close"]');
      button?.click();
      return Boolean(button);
    })()`
  );
  if (!closedCheckIn) throw new Error("Could not activate the check-in close control.");
  await waitFor(
    client,
    `!document.querySelector("dialog[open]")`,
    "check-in dialog to close"
  );
  await delay(200);

  await evaluate(
    client,
    `[...document.querySelectorAll("button")]
      .find((item) => item.textContent.includes("New check-in"))?.click()`
  );
  await waitFor(client, `Boolean(document.querySelector("dialog[open]"))`, "check-in dialog");
  const focusedActivity = await evaluate(
    client,
    `(() => {
      const input = document.querySelector('dialog[open] input[name="activity"]');
      if (!input) return false;
      input.focus();
      return true;
    })()`
  );
  if (!focusedActivity) throw new Error("Could not focus the check-in activity.");
  await client.send("Input.insertText", { text: "Browser smoke observation" });
  await waitFor(
    client,
    `document.querySelector('dialog[open] input[name="activity"]')?.value ===
      "Browser smoke observation"`,
    "the filled check-in activity"
  );
  await evaluate(
    client,
    `[...document.querySelectorAll('dialog[open] button')]
      .find((item) => item.textContent.includes("What helped?"))?.click()`
  );
  await waitFor(
    client,
    `document.body.innerText.includes("Step 2 · What helped?")`,
    "the second check-in step"
  );
  await evaluate(
    client,
    `[...document.querySelectorAll('dialog[open] button')]
      .find((item) => item.textContent.includes("Save check-in"))?.click()`
  );
  await waitFor(
    client,
    `!document.querySelector("dialog[open]") &&
      document.body.innerText.includes("Browser smoke observation")`,
    "the saved check-in"
  );
  await client.send("Page.reload", { ignoreCache: false });
  await waitFor(
    client,
    `document.body.innerText.includes("Browser smoke observation")`,
    "the check-in after reload"
  );

  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await delay(250);
  const layout = await evaluate(
    client,
    `({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bottomNav: getComputedStyle(document.querySelector(".bottom-nav")).display
    })`
  );
  if (layout.scrollWidth > layout.width + 1) {
    throw new Error(`Mobile layout overflows by ${layout.scrollWidth - layout.width}px.`);
  }
  if (layout.bottomNav === "none") throw new Error("The mobile navigation is not visible.");
  await saveScreenshot(client, "dashboard-mobile.png");

  await evaluate(client, `location.hash = "#/supports"`);
  await waitFor(
    client,
    `document.body.innerText.includes("Follow-through ledger")`,
    "the mobile support lab"
  );
  await evaluate(
    client,
    `(() => {
      document.documentElement.style.scrollBehavior = "auto";
      document.querySelector("#follow-heading")?.scrollIntoView({ block: "start" });
    })()`
  );
  await delay(200);
  const mobileSupportWidth = await evaluate(
    client,
    `({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth
    })`
  );
  if (mobileSupportWidth.scrollWidth > mobileSupportWidth.width + 1) {
    throw new Error(
      `Mobile support lab overflows by ${mobileSupportWidth.scrollWidth - mobileSupportWidth.width}px.`
    );
  }
  await saveScreenshot(client, "ledger-mobile.png");

  const accessibilityTree = await client.send("Accessibility.getFullAXTree");
  const namedRoles = new Set([
    "button",
    "checkbox",
    "combobox",
    "link",
    "radio",
    "slider",
    "switch",
    "textbox"
  ]);
  const unnamedControls = accessibilityTree.nodes.filter(
    (node) =>
      !node.ignored &&
      namedRoles.has(node.role?.value) &&
      !String(node.name?.value ?? "").trim()
  );
  if (unnamedControls.length) {
    throw new Error(
      `Accessibility tree contains ${unnamedControls.length} unnamed interactive control(s): ` +
        unnamedControls.map((node) => node.role?.value).join(", ")
    );
  }

  if (runtimeErrors.length) {
    throw new Error(`Browser errors:\n${runtimeErrors.join("\n")}`);
  }
  console.log("Browser smoke test passed: welcome, demo, four views, persisted check-in, dialogs, and mobile layouts.");
  console.log(`Screenshots: ${artifactDirectory}`);
} finally {
  if (client) {
    try {
      await client.send("Browser.close");
    } catch {
      browser?.kill();
    }
    client.close();
  } else {
    browser?.kill();
  }
  preview.kill();
  await delay(500);
  if (profileDirectory.startsWith(tmpdir())) {
    try {
      rmSync(profileDirectory, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 200
      });
    } catch (error) {
      console.warn(`Temporary browser profile could not be removed: ${error.message}`);
    }
  }
}
