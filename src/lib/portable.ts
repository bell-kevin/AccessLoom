import { z } from "zod";
import { db } from "../db";
import { localDateKey } from "./date";
import {
  barrierCategories,
  contexts,
  supportStatuses,
  type Adjustment,
  type CheckIn,
  type PassportSections,
  type WorkspaceRecord
} from "../types";

export const MAX_BACKUP_FILE_BYTES = 25 * 1024 * 1024;
const MAX_ADJUSTMENTS = 2_000;
const MAX_CHECK_INS = 20_000;
const MAX_COMMITMENTS = 5_000;
const idSchema = z.string().min(1).max(120);
const text = (maximum: number) => z.string().max(maximum);
const timestampSchema = z
  .string()
  .min(1)
  .max(40)
  .refine((value) => Number.isFinite(Date.parse(value)), "Invalid timestamp");
const isCalendarDate = (value: string): boolean => {
  if (value === "") return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};
const calendarDateSchema = z
  .string()
  .max(10)
  .refine(isCalendarDate, "Invalid calendar date");
const base64Schema = z
  .string()
  .regex(/^[A-Za-z0-9+/]*={0,2}$/, "Invalid base64 data");

const profileSchema = z.object({
  preferredName: text(80),
  roleContext: text(120),
  introduction: text(500),
  strengths: z.array(text(200)).max(30),
  communication: z.array(text(200)).max(30),
  workingConditions: z.array(text(200)).max(30),
  difficultDayPlan: text(600),
  reviewTriggers: text(400)
});

const passportSectionsSchema = z.object({
  introduction: z.boolean(),
  strengths: z.boolean(),
  communication: z.boolean(),
  workingConditions: z.boolean(),
  adjustments: z.boolean(),
  difficultDayPlan: z.boolean(),
  reviewTriggers: z.boolean()
});

const workspaceSchema = z.object({
  key: z.literal("workspace"),
  initialized: z.boolean(),
  isDemo: z.boolean(),
  createdAt: timestampSchema,
  profile: profileSchema,
  passportSections: passportSectionsSchema
});

const adjustmentSchema = z
  .object({
    id: idSchema,
    title: text(90),
    barrier: z.enum(barrierCategories),
    status: z.enum(supportStatuses),
    hypothesis: text(400),
    setup: text(500),
    successLooksLike: text(400),
    startedAt: calendarDateSchema,
    reviewDate: calendarDateSchema,
    effectiveness: z.number().int().min(0).max(5),
    effort: z.number().int().min(0).max(5),
    notes: text(500),
    includeInPassport: z.boolean(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema
  })
  .superRefine((value, context) => {
    if (value.status === "Trying" && (!value.startedAt || !value.reviewDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A trial requires start and review dates"
      });
    }
    if (
      value.startedAt &&
      value.reviewDate &&
      value.reviewDate < value.startedAt
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Review date cannot be before start date"
      });
    }
  });

const checkInSchema = z.object({
  id: idSchema,
  recordedAt: timestampSchema,
  context: z.enum(contexts),
  activity: text(120),
  barrier: z.enum(barrierCategories),
  friction: z.number().int().min(1).max(5),
  capacityBefore: z.number().int().min(1).max(5),
  capacityAfter: z.number().int().min(1).max(5),
  supportIds: z.array(idSchema).max(50),
  supportLabels: z.array(text(90)).max(50),
  note: text(500),
  win: text(180)
});

const commitmentSchema = z.object({
  id: idSchema,
  title: text(140),
  owner: text(80),
  dueDate: calendarDateSchema,
  status: z.enum(["Open", "Done"]),
  adjustmentId: idSchema.optional(),
  notes: text(400),
  createdAt: timestampSchema
});

const backupSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: timestampSchema,
  workspace: workspaceSchema,
  adjustments: z.array(adjustmentSchema).max(MAX_ADJUSTMENTS),
  checkIns: z.array(checkInSchema).max(MAX_CHECK_INS),
  commitments: z.array(commitmentSchema).max(MAX_COMMITMENTS)
});

export type BackupPayload = z.infer<typeof backupSchema>;

const encryptedEnvelopeSchema = z.object({
  format: z.literal("accessloom-encrypted-backup"),
  version: z.literal(1),
  kdf: z.object({
    name: z.literal("PBKDF2"),
    hash: z.literal("SHA-256"),
    iterations: z.literal(310_000),
    salt: base64Schema.length(24)
  }),
  cipher: z.object({
    name: z.literal("AES-GCM"),
    iv: base64Schema.length(16)
  }),
  data: base64Schema.min(1).max(MAX_BACKUP_FILE_BYTES)
});

const safeFilename = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "accessloom";

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const createBackupPayload = async (): Promise<BackupPayload> => {
  const workspace = await db.workspace.get("workspace");
  if (!workspace) throw new Error("No workspace is available to export.");
  const [adjustments, checkIns, commitments] = await Promise.all([
    db.adjustments.toArray(),
    db.checkIns.toArray(),
    db.commitments.toArray()
  ]);
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    workspace,
    adjustments,
    checkIns,
    commitments
  };
};

export const downloadBackup = async (): Promise<void> => {
  const payload = await createBackupPayload();
  const date = localDateKey();
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    }),
    `accessloom-backup-${date}.json`
  );
};

const bytesToBase64 = (value: Uint8Array): string => {
  let binary = "";
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const deriveBackupKey = async (
  passphrase: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const downloadEncryptedBackup = async (passphrase: string): Promise<void> => {
  if (passphrase.length < 10) {
    throw new Error("Use a passphrase of at least 10 characters.");
  }
  const payload = await createBackupPayload();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 310_000;
  const key = await deriveBackupKey(passphrase, salt, iterations);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const envelope = {
    format: "accessloom-encrypted-backup",
    version: 1,
    kdf: {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations,
      salt: bytesToBase64(salt)
    },
    cipher: {
      name: "AES-GCM",
      iv: bytesToBase64(iv)
    },
    data: bytesToBase64(new Uint8Array(ciphertext))
  } as const;
  const date = localDateKey();
  downloadBlob(
    new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" }),
    `accessloom-encrypted-${date}.json`
  );
};

const decryptEnvelope = async (
  envelope: z.infer<typeof encryptedEnvelopeSchema>,
  passphrase: string
): Promise<unknown> => {
  if (!passphrase) throw new Error("This backup is encrypted. Enter its passphrase.");
  try {
    const salt = base64ToBytes(envelope.kdf.salt);
    const iv = base64ToBytes(envelope.cipher.iv);
    const key = await deriveBackupKey(passphrase, salt, envelope.kdf.iterations);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      base64ToBytes(envelope.data)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    throw new Error("The passphrase is incorrect or the encrypted backup is damaged.");
  }
};

export const importBackup = async (file: File, passphrase = ""): Promise<void> => {
  if (file.size === 0) {
    throw new Error("This backup file is empty.");
  }
  if (file.size > MAX_BACKUP_FILE_BYTES) {
    throw new Error("This backup is too large to restore safely (25 MB maximum).");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  const envelopeResult = encryptedEnvelopeSchema.safeParse(raw);
  const data = envelopeResult.success
    ? await decryptEnvelope(envelopeResult.data, passphrase)
    : raw;
  const parsedResult = backupSchema.safeParse(data);
  if (!parsedResult.success) {
    const reason = parsedResult.error.issues[0]?.message ?? "Unknown schema error";
    throw new Error(`Backup validation failed: ${reason}. No data was changed.`);
  }
  const parsed = parsedResult.data;
  await db.transaction(
    "rw",
    [db.workspace, db.adjustments, db.checkIns, db.commitments],
    async () => {
      await Promise.all([
        db.workspace.clear(),
        db.adjustments.clear(),
        db.checkIns.clear(),
        db.commitments.clear()
      ]);
      await db.workspace.put(parsed.workspace);
      await db.adjustments.bulkPut(parsed.adjustments);
      await db.checkIns.bulkPut(parsed.checkIns);
      await db.commitments.bulkPut(parsed.commitments);
    }
  );
};

const lineList = (values: string[]): string =>
  values.length ? values.map((value) => `• ${value}`).join("\n") : "Not included.";

export interface ShareableSupportDetails {
  title: string;
  status: string;
  setup: string;
  successMarker: string;
  personalReview: string;
  observationSummary: string;
}

const signed = (value: number): string =>
  value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);

export const getShareableSupportDetails = (
  adjustment: Adjustment,
  checkIns: CheckIn[]
): ShareableSupportDetails => {
  const linked = checkIns.filter((item) => item.supportIds.includes(adjustment.id));
  const averageFriction = linked.length
    ? linked.reduce((sum, item) => sum + item.friction, 0) / linked.length
    : 0;
  const averageCapacityChange = linked.length
    ? linked.reduce(
        (sum, item) => sum + item.capacityAfter - item.capacityBefore,
        0
      ) / linked.length
    : 0;

  return {
    title: adjustment.title,
    status: adjustment.status,
    setup: adjustment.setup,
    successMarker: adjustment.successLooksLike,
    personalReview:
      adjustment.effectiveness > 0 || adjustment.effort > 0
        ? [
            adjustment.effectiveness > 0
              ? `helpfulness ${adjustment.effectiveness}/5`
              : "",
            adjustment.effort > 0 ? `setup effort ${adjustment.effort}/5` : ""
          ]
            .filter(Boolean)
            .join(" · ")
        : "",
    observationSummary: linked.length
      ? `${linked.length} linked check-in${linked.length === 1 ? "" : "s"} · average reported friction ${averageFriction.toFixed(1)}/5 · average capacity change ${signed(averageCapacityChange)}`
      : ""
  };
};

export const buildPassportText = (
  workspace: WorkspaceRecord,
  adjustments: Adjustment[],
  checkIns: CheckIn[] = []
): string => {
  const { profile, passportSections } = workspace;
  const shared = adjustments.filter((item) => item.includeInPassport);
  const sections: string[] = [
    `${profile.preferredName || "My"} — ACCESS PASSPORT`,
    profile.roleContext,
    `Prepared ${new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date())}`
  ].filter(Boolean);

  if (passportSections.introduction && profile.introduction) {
    sections.push(`HOW I WORK BEST\n${profile.introduction}`);
  }
  if (passportSections.strengths) {
    sections.push(`STRENGTHS I BRING\n${lineList(profile.strengths)}`);
  }
  if (passportSections.communication) {
    sections.push(`COMMUNICATION THAT HELPS\n${lineList(profile.communication)}`);
  }
  if (passportSections.workingConditions) {
    sections.push(`WORKING CONDITIONS\n${lineList(profile.workingConditions)}`);
  }
  if (passportSections.adjustments) {
    sections.push(
      `SUPPORTS TO PUT IN PLACE\n${
        shared.length
          ? shared
              .map(
                (item) => {
                  const details = getShareableSupportDetails(item, checkIns);
                  return [
                    `• ${details.title} [${details.status}]`,
                    `  ${details.setup}`,
                    details.successMarker
                      ? `  Success marker: ${details.successMarker}`
                      : "",
                    details.personalReview
                      ? `  Personal review: ${details.personalReview}`
                      : "",
                    details.observationSummary
                      ? `  Observed summary: ${details.observationSummary}`
                      : ""
                  ]
                    .filter(Boolean)
                    .join("\n");
                }
              )
              .join("\n\n")
          : "No supports selected."
      }${
        shared.length
          ? "\n\nAggregate summaries are descriptive associations in self-recorded entries, not proof that a support caused a change. Private notes and individual check-ins are not included."
          : ""
      }`
    );
  }
  if (passportSections.difficultDayPlan && profile.difficultDayPlan) {
    sections.push(`WHEN CAPACITY CHANGES\n${profile.difficultDayPlan}`);
  }
  if (passportSections.reviewTriggers && profile.reviewTriggers) {
    sections.push(`WHEN TO REVIEW THIS\n${profile.reviewTriggers}`);
  }
  sections.push(
    "This is a communication aid owned by the person named above. It is not a medical record, legal determination, or automatic approval of an accommodation."
  );
  return sections.join("\n\n");
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const htmlList = (values: string[]): string =>
  values.length
    ? `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`
    : "<p>Not included.</p>";

const htmlSection = (label: string, content: string): string =>
  `<section><p class="eyebrow">${escapeHtml(label)}</p>${content}</section>`;

export const buildPassportHtml = (
  workspace: WorkspaceRecord,
  adjustments: Adjustment[],
  checkIns: CheckIn[] = []
): string => {
  const { profile, passportSections } = workspace;
  const shared = adjustments.filter((item) => item.includeInPassport);
  const sections: string[] = [];
  if (passportSections.introduction && profile.introduction) {
    sections.push(htmlSection("How I work best", `<p>${escapeHtml(profile.introduction)}</p>`));
  }
  if (passportSections.strengths) {
    sections.push(htmlSection("Strengths I bring", htmlList(profile.strengths)));
  }
  if (passportSections.communication) {
    sections.push(htmlSection("Communication that helps", htmlList(profile.communication)));
  }
  if (passportSections.workingConditions) {
    sections.push(htmlSection("Working conditions", htmlList(profile.workingConditions)));
  }
  if (passportSections.adjustments) {
    sections.push(
      htmlSection(
        "Supports to put in place",
        shared.length
          ? `<ul>${shared
              .map((item) => {
                const details = getShareableSupportDetails(item, checkIns);
                const detailLines = [
                  details.successMarker
                    ? `<span><b>Success marker:</b> ${escapeHtml(details.successMarker)}</span>`
                    : "",
                  details.personalReview
                    ? `<span><b>Personal review:</b> ${escapeHtml(details.personalReview)}</span>`
                    : "",
                  details.observationSummary
                    ? `<span><b>Observed summary:</b> ${escapeHtml(details.observationSummary)}</span>`
                    : ""
                ]
                  .filter(Boolean)
                  .join("");
                return `<li><strong>${escapeHtml(details.title)}</strong> <em>${escapeHtml(details.status)}</em><br>${escapeHtml(details.setup)}${detailLines ? `<span class="evidence">${detailLines}</span>` : ""}</li>`;
              })
              .join("")}</ul><p class="method">Aggregate summaries are descriptive associations in self-recorded entries, not proof that a support caused a change. Private notes and individual check-ins are not included.</p>`
          : "<p>No supports selected.</p>"
      )
    );
  }
  if (passportSections.difficultDayPlan && profile.difficultDayPlan) {
    sections.push(
      htmlSection("When capacity changes", `<p>${escapeHtml(profile.difficultDayPlan)}</p>`)
    );
  }
  if (passportSections.reviewTriggers && profile.reviewTriggers) {
    sections.push(
      htmlSection("When to review this", `<p>${escapeHtml(profile.reviewTriggers)}</p>`)
    );
  }

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${escapeHtml(profile.preferredName || "My")} — Access passport</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#ede9e0;color:#173f38;font:16px/1.55 system-ui,sans-serif}
main{width:min(800px,calc(100% - 32px));margin:32px auto;background:#fff;padding:56px;border-top:10px solid #f2a65a}
h1{font:700 clamp(2rem,7vw,4rem)/.95 Georgia,serif;margin:.15em 0}.role{color:#557069}.date{font-size:.85rem;color:#667}
section{padding:24px 0;border-top:1px solid #d8d5cc}.eyebrow{text-transform:uppercase;letter-spacing:.13em;font-size:.72rem;font-weight:800;color:#b35d20}
ul{padding-left:1.2rem}li+li{margin-top:.6rem}.note{margin-top:40px;padding:16px;background:#f4f0e8;font-size:.8rem}
.evidence{display:grid;margin:.45rem 0 0;color:#557069;font-size:.9rem}.evidence b{color:#173f38}.method{color:#667;font-size:.82rem;font-style:italic}
@media(max-width:600px){main{padding:28px}}@media print{body{background:#fff}main{width:100%;margin:0;padding:24px}.note{break-inside:avoid}}
</style></head><body><main>
<p class="eyebrow">Personal access passport</p>
<h1>${escapeHtml(profile.preferredName || "My passport")}</h1>
${profile.roleContext ? `<p class="role">${escapeHtml(profile.roleContext)}</p>` : ""}
<p class="date">Prepared ${escapeHtml(new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date()))}</p>
${sections.join("")}
<p class="note">This is a communication aid owned by the person named above. It is not a medical record, legal determination, or automatic approval of an accommodation. Created privately with AccessLoom.</p>
</main></body></html>`;
};

export const downloadPassportHtml = (
  workspace: WorkspaceRecord,
  adjustments: Adjustment[],
  checkIns: CheckIn[] = []
): void => {
  const filename = `${safeFilename(workspace.profile.preferredName)}-access-passport.html`;
  downloadBlob(
    new Blob([buildPassportHtml(workspace, adjustments, checkIns)], { type: "text/html" }),
    filename
  );
};

export const saveWorkspacePreferences = async (
  profile: WorkspaceRecord["profile"],
  passportSections: PassportSections
): Promise<void> => {
  await db.workspace.update("workspace", { profile, passportSections });
};
