import { describe, expect, it } from "vitest";
import { createDemoData } from "../data/demo";
import {
  MAX_BACKUP_FILE_BYTES,
  buildPassportHtml,
  buildPassportText,
  importBackup
} from "./portable";

describe("portable passport", () => {
  it("includes only adjustments selected for sharing", () => {
    const demo = createDemoData();
    const text = buildPassportText(demo.workspace, demo.adjustments, demo.checkIns);
    expect(text).toContain("Written meeting agenda");
    expect(text).not.toContain("Camera-optional calls");
    expect(text).toContain("[Helpful]");
    expect(text).toContain("linked check-ins");
  });

  it("never includes private support notes in any passport format", () => {
    const demo = createDemoData();
    demo.adjustments[0].notes = "PRIVATE-SUPPORT-NOTE-SENTINEL";
    const text = buildPassportText(demo.workspace, demo.adjustments, demo.checkIns);
    const html = buildPassportHtml(demo.workspace, demo.adjustments, demo.checkIns);
    expect(text).not.toContain("PRIVATE-SUPPORT-NOTE-SENTINEL");
    expect(html).not.toContain("PRIVATE-SUPPORT-NOTE-SENTINEL");
  });

  it("escapes user content in standalone HTML", () => {
    const demo = createDemoData();
    demo.workspace.profile.preferredName = "<script>alert(1)</script>";
    demo.adjustments[0].successLooksLike = "<img src=x onerror=alert(1)>";
    const html = buildPassportHtml(demo.workspace, demo.adjustments, demo.checkIns);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });

  it("rejects oversized and malformed backup files before reading records", async () => {
    const oversized = {
      size: MAX_BACKUP_FILE_BYTES + 1,
      text: async () => "{}"
    } as File;
    await expect(importBackup(oversized)).rejects.toThrow("25 MB maximum");
    await expect(
      importBackup(new File(["not json"], "broken.json"))
    ).rejects.toThrow("not valid JSON");
  });

  it("rejects invalid dates before replacing the database", async () => {
    const demo = createDemoData();
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      workspace: demo.workspace,
      adjustments: demo.adjustments,
      checkIns: [
        {
          ...demo.checkIns[0],
          recordedAt: "not-a-date"
        }
      ],
      commitments: demo.commitments
    };
    await expect(
      importBackup(
        new File([JSON.stringify(payload)], "invalid-date.json", {
          type: "application/json"
        })
      )
    ).rejects.toThrow("Invalid timestamp");
  });

  it("rejects an undated support marked as a trial", async () => {
    const demo = createDemoData();
    const trial = demo.adjustments.find((item) => item.status === "Trying")!;
    trial.reviewDate = "";
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      workspace: demo.workspace,
      adjustments: demo.adjustments,
      checkIns: demo.checkIns,
      commitments: demo.commitments
    };
    await expect(
      importBackup(new File([JSON.stringify(payload)], "undated-trial.json"))
    ).rejects.toThrow("A trial requires start and review dates");
  });
});
