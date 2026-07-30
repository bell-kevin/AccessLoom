# Deploying AccessLoom with Bolt

AccessLoom is intentionally a static Vite application. Bolt only has to build and
serve HTML, CSS, JavaScript, the web app manifest, and the service worker. There
is no production Node process, database, server function, API key, or account
service to configure.

This guide reflects the project as implemented:

- Vite + React + TypeScript
- Dexie over the browser's IndexedDB
- hash navigation (`#/today`, `#/patterns`, `#/supports`, and `#/passport`)
- a hand-written, progressively enhanced service worker
- plain and passphrase-encrypted backup files

## Before importing the repository

1. Put the complete project in a GitHub repository, including
   `package-lock.json`, `public/`, and this `docs/` directory.
2. Keep `.env`, `node_modules/`, and `dist/` out of Git. The existing
   `.gitignore` already does this.
3. Make the GitHub repository public when it is ready. A repository created
   from inside Bolt starts private, so that visibility change must be made on
   GitHub.
4. Set `VITE_SOURCE_URL` to the public repository URL in Bolt's project
   environment settings. It is used only for the in-app source-code link and is
   not a secret. For local development, copy `.env.example` to `.env` and set
   the same value there.

Anything prefixed with `VITE_` is compiled into browser JavaScript and is public.
Never put a password, token, private key, or Supabase service-role key in a
`VITE_` variable.

## Import into Bolt

Bolt works best in a Chromium-based desktop browser.

1. Open [bolt.new](https://bolt.new/).
2. Select the GitHub import option on the Bolt home page.
3. Authorize StackBlitz/Bolt if prompted.
4. Select the AccessLoom repository, or choose **Import from URL** and paste its
   GitHub URL.
5. Let Bolt install the locked dependencies and start its preview.

Bolt supports importing an existing GitHub repository directly. Its current
workflow is documented in
[GitHub for version control](https://support.bolt.new/integrations/git).

Avoid editing the same branch in Bolt and elsewhere at the same time. Bolt polls
GitHub for changes, but its documentation notes that a simultaneous Bolt and
GitHub update can result in the Bolt version overwriting the GitHub version.
Use a feature branch for substantial work and merge it on GitHub; Bolt does not
merge branches in-app.

## Build and verify

Run each command in Bolt's terminal:

```sh
npm ci
npm run test
npm run typecheck
npm run build
```

The production command is defined in `package.json`:

```text
tsc -b && vite build
```

Vite writes the deployable site to `dist/`. The build also copies the contents
of `public/` to the root of `dist/`, including `sw.js`,
`manifest.webmanifest`, and the PWA icons.

`npm run build` is an important release gate. A working development preview can
still hide type or production-bundling errors. Bolt also recommends running the
production build when diagnosing preview or publishing problems.

Optionally inspect the exact production output with:

```sh
npm run preview -- --host 0.0.0.0
```

Before publishing, verify:

- a blank workspace and the fictional demo both initialize;
- a check-in, support, and commitment persist after a reload;
- `#/today`, `#/patterns`, `#/supports`, and `#/passport` all open correctly;
- plain JSON export and restore work;
- encrypted export and restore work with the correct passphrase and fail safely
  with a wrong one;
- restore rejects an oversized, malformed, or invalid-date backup without
  changing the current workspace;
- the generated passport contains only the sections and supports selected by
  the user, never private notes or individual check-ins;
- display preferences persist;
- the browser storage-persistence request gives a clear result;
- the app still works online when service-worker registration is unavailable;
- `VITE_SOURCE_URL` points to the exact public corresponding-source repository.

## Why hash navigation is deliberate

AccessLoom does not use pathname routes such as `/patterns`. It stores the
current view in the fragment after `#`, for example:

```text
https://example.bolt.host/#/patterns
```

The browser does not send that fragment to the host. Every navigation therefore
requests the same root `index.html`, so the application does not depend on a
host-specific single-page-app rewrite rule. This is safer on Bolt and keeps the
same build portable to other static hosts.

The current PWA files use root-relative paths such as `/sw.js` and `/index.html`.
Deploy AccessLoom at an origin root, as a `*.bolt.host` site or custom domain
does. A deployment under a subdirectory requires coordinated changes to the
service-worker registration, cache paths, manifest `start_url` and `scope`, and
Vite `base`.

## Publish

1. Open Bolt's **Publish** menu.
2. Choose public visibility.
3. Click **Publish** and wait for the generated `*.bolt.host` address.
4. Open the published URL in a new tab and repeat the smoke checks below.
5. For later releases, use **Publish → Update**. Editing the project does not
   update the live site automatically.

Use the Publish/Update controls rather than asking the Bolt agent to publish.
Bolt documents that the controls do not consume AI tokens.

All Bolt plans currently include a `*.bolt.host` address. A custom domain
requires a paid plan. See Bolt's current
[publishing guide](https://support.bolt.new/cloud/hosting/publish) before launch
because product behavior and plan terms can change.

## Published-site smoke check

Use the real published origin, not only Bolt's preview:

1. Open the site in a normal browser window and create a small disposable
   workspace.
2. Reload and confirm that the record remains.
3. Open `#/passport` directly in a new tab.
4. In browser developer tools, inspect **Application → Manifest** and
   **Application → Service Workers**.
5. After one complete online load, enable the browser's offline network mode
   and reload. The cached application should open.
6. Return online before testing exports, updates, or a different origin.
7. Check the Network panel while using the app. Apart from loading same-origin
   application files and links the user explicitly opens, AccessLoom should not
   send runtime data anywhere.

PWA installation support varies by browser and operating system. Installation
is an enhancement, not a prerequisite: the website and IndexedDB workspace must
remain usable when installation or service-worker registration is unavailable.

## Service-worker release checklist

`public/sw.js` is maintained by this repository rather than generated by a Vite
plugin.

- It uses network-first handling for navigations.
- It uses cache-first handling for fetched same-origin static assets.
- It does not read from or write to IndexedDB.
- It shows an update prompt through `PwaUpdateToast` instead of forcibly
  reloading an open form.

For every release that should trigger the visible update prompt, increment
`CACHE_VERSION` in `public/sw.js`, then rebuild. Because the worker is
hand-written, the Vite build does not bump this value automatically. Test the
upgrade from the previously published version, not just a clean installation.

Do not assume "works offline" means "backed up." The service-worker cache holds
application code and static files; user records remain in origin-bound
IndexedDB.

## Critical: browser data belongs to the origin

AccessLoom data is local to the exact browser origin. These are separate
workspaces:

- a Bolt preview URL and the published `*.bolt.host` URL;
- two different `*.bolt.host` names;
- a `*.bolt.host` name and a custom domain;
- HTTP and HTTPS origins;
- different browser profiles or devices.

Changing the hostname does not move IndexedDB or `localStorage`. The data may
look missing even though it still exists under the old origin.

Before renaming a Bolt hostname, attaching a custom domain, or moving hosts:

1. Open the old live origin.
2. Go to **Settings → Data**.
3. Export a complete backup. Use the encrypted option for sensitive data and
   retain its passphrase separately.
4. Keep the old origin available until the backup has been restored and checked.
5. Publish the new origin.
6. Open **Settings → Data → Restore a backup** on the new origin.
7. Confirm the workspace, supports, check-ins, commitments, and passport.
8. Only then retire the old origin.

The same backup process is the portability path between browsers and devices.
The browser's durable-storage permission can reduce automatic eviction, but it
is not a substitute for a backup.

## Free-host resource posture

As checked on July 29, 2026, Bolt documents these account-wide monthly limits:

- Free: 10 GB bandwidth and 333,333 requests, with a hard stop until the next
  billing reset.
- Pro: 30 GB bandwidth and 1 million requests, with optional paid overage.

Multiple Bolt sites share the allowance. Free sites also display a Made in Bolt
badge. Confirm current values on Bolt's
[hosting plans page](https://support.bolt.new/cloud/hosting/plans).

AccessLoom is designed to be inexpensive to serve:

- there is no database, file-storage, or server-function traffic;
- there are no remote fonts, analytics SDKs, ads, or third-party application
  APIs;
- icons are tree-shaken from `lucide-react`;
- PWA icons are small SVG files;
- repeat static assets can be served from the browser cache.

Keep that posture when extending the project. Avoid large bundled media,
unbounded seed datasets, auto-playing video, and unnecessary dependencies.
Check `dist/` after each production build and investigate unexpected bundle
growth.

## Rollback and recovery

Code rollback and data rollback are separate operations.

- GitHub/Bolt version history can restore application code.
- It does not restore a user's browser database.
- Importing a backup replaces all four current IndexedDB tables after the file
  has been decrypted, parsed, and validated.

Before releasing a future Dexie schema migration, test both forward migration
and rollback behavior with realistic data. Keep backup schema migrations
forward-compatible; do not publish a code rollback that can no longer read a
database already upgraded by a newer release.
