import Dexie, { type EntityTable } from "dexie";
import { createDemoData } from "./data/demo";
import {
  defaultPassportSections,
  emptyProfile,
  type Adjustment,
  type CheckIn,
  type Commitment,
  type WorkspaceRecord
} from "./types";

class AccessLoomDatabase extends Dexie {
  checkIns!: EntityTable<CheckIn, "id">;
  adjustments!: EntityTable<Adjustment, "id">;
  commitments!: EntityTable<Commitment, "id">;
  workspace!: EntityTable<WorkspaceRecord, "key">;

  constructor() {
    super("accessloom");
    this.version(1).stores({
      checkIns: "id, recordedAt, context, barrier, *supportIds",
      adjustments: "id, status, barrier, reviewDate, includeInPassport, updatedAt",
      commitments: "id, status, dueDate, adjustmentId",
      workspace: "key"
    });
    this.version(2).stores({
      commitments: "id, status, dueDate, adjustmentId, createdAt"
    });
  }
}

export const db = new AccessLoomDatabase();

export const initializeDemoWorkspace = async (): Promise<void> => {
  const demo = createDemoData();
  await db.transaction(
    "rw",
    [db.checkIns, db.adjustments, db.commitments, db.workspace],
    async () => {
      await Promise.all([
        db.checkIns.clear(),
        db.adjustments.clear(),
        db.commitments.clear(),
        db.workspace.clear()
      ]);
      await db.workspace.add(demo.workspace);
      await db.adjustments.bulkAdd(demo.adjustments);
      await db.checkIns.bulkAdd(demo.checkIns);
      await db.commitments.bulkAdd(demo.commitments);
    }
  );
};

export const initializeFreshWorkspace = async (preferredName = ""): Promise<void> => {
  const now = new Date().toISOString();
  await db.transaction(
    "rw",
    [db.checkIns, db.adjustments, db.commitments, db.workspace],
    async () => {
      await Promise.all([
        db.checkIns.clear(),
        db.adjustments.clear(),
        db.commitments.clear(),
        db.workspace.clear()
      ]);
      await db.workspace.add({
        key: "workspace",
        initialized: true,
        isDemo: false,
        createdAt: now,
        profile: { ...emptyProfile, preferredName },
        passportSections: { ...defaultPassportSections }
      });
    }
  );
};

export const clearWorkspace = async (): Promise<void> => {
  await db.transaction(
    "rw",
    [db.checkIns, db.adjustments, db.commitments, db.workspace],
    async () => {
      await Promise.all([
        db.checkIns.clear(),
        db.adjustments.clear(),
        db.commitments.clear(),
        db.workspace.clear()
      ]);
    }
  );
};
