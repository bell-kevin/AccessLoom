import { useEffect, useState } from "react";
import { db } from "../db";
import { createId } from "../lib/id";
import type { Adjustment } from "../types";
import { Dialog } from "./ui/Dialog";

interface CommitmentDialogProps {
  open: boolean;
  adjustments: Adjustment[];
  initialAdjustmentId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function CommitmentDialog({
  open,
  adjustments,
  initialAdjustmentId,
  onClose,
  onSaved
}: CommitmentDialogProps) {
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [adjustmentId, setAdjustmentId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setOwner("");
    setDueDate("");
    setAdjustmentId(initialAdjustmentId ?? "");
    setNotes("");
    setSaving(false);
  }, [open, initialAdjustmentId]);

  const save = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await db.commitments.add({
        id: createId("commitment"),
        title: title.trim(),
        owner: owner.trim() || "Not assigned",
        dueDate,
        status: "Open",
        adjustmentId: adjustmentId || undefined,
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Capture a follow-through"
      description="A clear owner and a review date keep support from disappearing after a good conversation."
    >
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          const titleInput = event.currentTarget.elements.namedItem(
            "commitmentTitle"
          ) as HTMLInputElement;
          titleInput.setCustomValidity(
            title.trim() ? "" : "Describe the follow-through action."
          );
          if (!event.currentTarget.reportValidity()) return;
          void save();
        }}
      >
        <label className="field">
          <span>What will happen? <small>Required</small></span>
          <input
            name="commitmentTitle"
            value={title}
            onChange={(event) => {
              event.currentTarget.setCustomValidity("");
              setTitle(event.target.value);
            }}
            autoFocus
            maxLength={140}
            required
          />
        </label>
        <div className="two-column-fields">
          <label className="field">
            <span>Owner <small>Optional</small></span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Name or role" maxLength={80} />
          </label>
          <label className="field">
            <span>Due or review date <small>Optional</small></span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Related support <small>Optional</small></span>
          <select value={adjustmentId} onChange={(event) => setAdjustmentId(event.target.value)}>
            <option value="">No linked support</option>
            {adjustments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Notes <small>Optional</small></span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} maxLength={400} />
        </label>
        <div className="dialog__actions">
          <button className="button button--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="button button--primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Add follow-through"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
