import { useEffect, useState } from "react";
import { db } from "../db";
import { createId } from "../lib/id";
import { localDateKey, shiftCalendarDate, toDateInput } from "../lib/date";
import {
  barrierCategories,
  supportStatuses,
  type Adjustment,
  type BarrierCategory,
  type SupportStatus
} from "../types";
import { Dialog } from "./ui/Dialog";

interface AdjustmentDialogProps {
  open: boolean;
  initial?: Partial<Adjustment> | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AdjustmentDialog({
  open,
  initial,
  onClose,
  onSaved
}: AdjustmentDialogProps) {
  const [title, setTitle] = useState("");
  const [barrier, setBarrier] = useState<BarrierCategory>("Focus & interruption");
  const [status, setStatus] = useState<SupportStatus>("Idea");
  const [hypothesis, setHypothesis] = useState("");
  const [setup, setSetup] = useState("");
  const [successLooksLike, setSuccessLooksLike] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [effectiveness, setEffectiveness] = useState(0);
  const [effort, setEffort] = useState(0);
  const [notes, setNotes] = useState("");
  const [includeInPassport, setIncludeInPassport] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setBarrier(initial?.barrier ?? "Focus & interruption");
    setStatus(initial?.status ?? "Idea");
    setHypothesis(initial?.hypothesis ?? "");
    setSetup(initial?.setup ?? "");
    setSuccessLooksLike(initial?.successLooksLike ?? "");
    setStartedAt(toDateInput(initial?.startedAt));
    setReviewDate(toDateInput(initial?.reviewDate));
    setEffectiveness(initial?.effectiveness ?? 0);
    setEffort(initial?.effort ?? 0);
    setNotes(initial?.notes ?? "");
    setIncludeInPassport(initial?.includeInPassport ?? false);
  }, [open, initial]);

  const startTrial = () => {
    setStatus("Trying");
    if (!startedAt) setStartedAt(localDateKey());
    if (!reviewDate) setReviewDate(shiftCalendarDate(localDateKey(), 14));
  };

  const save = async () => {
    if (!title.trim() || !setup.trim()) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const value: Adjustment = {
        id: initial?.id ?? createId("support"),
        title: title.trim(),
        barrier,
        status,
        hypothesis: hypothesis.trim(),
        setup: setup.trim(),
        successLooksLike: successLooksLike.trim(),
        startedAt,
        reviewDate,
        effectiveness,
        effort,
        notes: notes.trim(),
        includeInPassport,
        createdAt: initial?.createdAt ?? now,
        updatedAt: now
      };
      await db.adjustments.put(value);
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
      title={initial?.id ? "Edit support" : "Add a support idea"}
      description="Make the setup concrete enough that you can tell whether it happened."
      wide
    >
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          const titleInput = event.currentTarget.elements.namedItem(
            "supportTitle"
          ) as HTMLInputElement;
          const setupInput = event.currentTarget.elements.namedItem(
            "supportSetup"
          ) as HTMLTextAreaElement;
          titleInput.setCustomValidity(
            title.trim() ? "" : "Add a short name for this support."
          );
          setupInput.setCustomValidity(
            setup.trim() ? "" : "Describe what would change in practice."
          );
          const startInput = event.currentTarget.elements.namedItem(
            "trialStart"
          ) as HTMLInputElement | null;
          const reviewInput = event.currentTarget.elements.namedItem(
            "trialReview"
          ) as HTMLInputElement | null;
          startInput?.setCustomValidity(
            status === "Trying" && !startedAt
              ? "Choose when this trial starts."
              : ""
          );
          reviewInput?.setCustomValidity(
            status === "Trying" && !reviewDate
              ? "Choose when this trial will be reviewed."
              : startedAt && reviewDate && reviewDate < startedAt
                ? "The review date must be on or after the start date."
                : ""
          );
          if (!event.currentTarget.reportValidity()) return;
          void save();
        }}
      >
        <div className="two-column-fields">
          <label className="field">
            <span>Support name <small>Required</small></span>
            <input
              name="supportTitle"
              value={title}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                setTitle(event.target.value);
              }}
              maxLength={90}
              required
            />
          </label>
          <label className="field">
            <span>Friction area</span>
            <select value={barrier} onChange={(event) => setBarrier(event.target.value as BarrierCategory)}>
              {barrierCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <label className="field">
          <span>What would change in practice? <small>Required</small></span>
          <textarea
            name="supportSetup"
            value={setup}
            onChange={(event) => {
              event.currentTarget.setCustomValidity("");
              setSetup(event.target.value);
            }}
            placeholder="Who does what, when, and in which situations?"
            rows={3}
            maxLength={500}
            required
          />
        </label>

        <div className="two-column-fields">
          <label className="field">
            <span>Working hypothesis <small>Not a promise</small></span>
            <textarea
              value={hypothesis}
              onChange={(event) => setHypothesis(event.target.value)}
              placeholder="I think this may help because…"
              rows={3}
              maxLength={400}
            />
          </label>
          <label className="field">
            <span>What would “helpful” look like?</span>
            <textarea
              value={successLooksLike}
              onChange={(event) => setSuccessLooksLike(event.target.value)}
              placeholder="A practical signal you can notice…"
              rows={3}
              maxLength={400}
            />
          </label>
        </div>

        <div className="two-column-fields">
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as SupportStatus)}>
              {supportStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button className="trial-shortcut" type="button" onClick={startTrial}>
            <strong>Turn this into a 14-day trial</strong>
            <span>Sets status, start, and review dates</span>
          </button>
        </div>

        {(status === "Trying" || startedAt || reviewDate) && (
          <div className="two-column-fields">
            <label className="field">
              <span>Trial starts {status === "Trying" && <small>Required</small>}</span>
              <input
                name="trialStart"
                type="date"
                value={startedAt}
                required={status === "Trying"}
                onChange={(event) => {
                  event.currentTarget.setCustomValidity("");
                  setStartedAt(event.target.value);
                }}
              />
            </label>
            <label className="field">
              <span>Review together {status === "Trying" && <small>Required</small>}</span>
              <input
                name="trialReview"
                type="date"
                value={reviewDate}
                min={startedAt || undefined}
                required={status === "Trying"}
                onChange={(event) => {
                  event.currentTarget.setCustomValidity("");
                  setReviewDate(event.target.value);
                }}
              />
            </label>
          </div>
        )}

        {(status === "Helpful" || status === "Agreed" || effectiveness > 0) && (
          <div className="two-column-fields">
            <label className="range-field">
              <span><strong>How helpful?</strong><output>{effectiveness || "Not rated"}</output></span>
              <input
                type="range"
                min="0"
                max="5"
                value={effectiveness}
                aria-valuetext={effectiveness ? `${effectiveness} out of 5` : "Not rated"}
                onChange={(event) => setEffectiveness(Number(event.target.value))}
              />
            </label>
            <label className="range-field">
              <span><strong>Setup effort</strong><output>{effort || "Not rated"}</output></span>
              <input
                type="range"
                min="0"
                max="5"
                value={effort}
                aria-valuetext={effort ? `${effort} out of 5` : "Not rated"}
                onChange={(event) => setEffort(Number(event.target.value))}
              />
            </label>
          </div>
        )}

        <label className="field">
          <span>Private notes <small>Never included in the passport automatically</small></span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} maxLength={500} />
        </label>

        <label className="switch-row">
          <span>
            <strong>Include this support in my passport</strong>
            <small>You can change this at any time.</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={includeInPassport}
            onChange={(event) => setIncludeInPassport(event.target.checked)}
          />
        </label>

        <div className="dialog__actions">
          <button className="button button--ghost" type="button" onClick={onClose}>Cancel</button>
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : initial?.id ? "Save changes" : "Add support"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
