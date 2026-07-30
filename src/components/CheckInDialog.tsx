import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { db } from "../db";
import { createId } from "../lib/id";
import {
  barrierCategories,
  contexts,
  type Adjustment,
  type BarrierCategory,
  type WorkContext
} from "../types";
import { Dialog } from "./ui/Dialog";

interface CheckInDialogProps {
  open: boolean;
  adjustments: Adjustment[];
  onClose: () => void;
  onSaved: () => void;
}

const frictionLabels = ["Barely there", "Light", "Noticeable", "Heavy", "Blocking"];
const capacityLabels = ["Empty", "Low", "Steady", "Good", "Full"];

export function CheckInDialog({
  open,
  adjustments,
  onClose,
  onSaved
}: CheckInDialogProps) {
  const [context, setContext] = useState<WorkContext>("Focused work");
  const [activity, setActivity] = useState("");
  const [barrier, setBarrier] = useState<BarrierCategory>("Focus & interruption");
  const [friction, setFriction] = useState(3);
  const [capacityBefore, setCapacityBefore] = useState(3);
  const [capacityAfter, setCapacityAfter] = useState(3);
  const [supportIds, setSupportIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [win, setWin] = useState("");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    setContext("Focused work");
    setActivity("");
    setBarrier("Focus & interruption");
    setFriction(3);
    setCapacityBefore(3);
    setCapacityAfter(3);
    setSupportIds([]);
    setNote("");
    setWin("");
    setStep(1);
  }, [open]);

  useEffect(() => {
    if (!open || step !== 2) return;
    const frame = window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, step]);

  const availableSupports = adjustments.filter(
    (item) => item.status !== "Paused" && item.status !== "Idea"
  );

  const save = async () => {
    if (!activity.trim()) return;
    setSaving(true);
    try {
      const selected = availableSupports.filter((item) => supportIds.includes(item.id));
      await db.checkIns.add({
        id: createId("check"),
        recordedAt: new Date().toISOString(),
        context,
        activity: activity.trim(),
        barrier,
        friction,
        capacityBefore,
        capacityAfter,
        supportIds,
        supportLabels: selected.map((item) => item.title),
        note: note.trim(),
        win: win.trim()
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
      title="Two-minute check-in"
      description="Describe the fit between the task and the environment. This is not a test of you."
      wide
    >
      <div className="dialog-progress" aria-label={`Step ${step} of 2`}>
        <span className="is-active" />
        <span className={step === 2 ? "is-active" : ""} />
      </div>

      {step === 1 ? (
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            const activityInput = event.currentTarget.elements.namedItem(
              "activity"
            ) as HTMLInputElement;
            if (!activity.trim()) {
              activityInput.setCustomValidity("Describe the work moment before continuing.");
              activityInput.reportValidity();
              return;
            }
            setStep(2);
          }}
        >
          <fieldset>
            <legend>What kind of moment was this?</legend>
            <div className="choice-grid choice-grid--compact">
              {contexts.map((item) => (
                <button
                  key={item}
                  className={context === item ? "choice-chip is-selected" : "choice-chip"}
                  type="button"
                  aria-pressed={context === item}
                  onClick={() => setContext(item)}
                >
                  {context === item && <Check size={14} aria-hidden="true" />}
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>What were you trying to do? <small>Required</small></span>
            <input
              name="activity"
              value={activity}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                setActivity(event.target.value);
              }}
              placeholder="e.g. Review a detailed document"
              maxLength={120}
              required
            />
          </label>

          <fieldset>
            <legend>Where did the friction show up most?</legend>
            <div className="choice-grid">
              {barrierCategories.map((item) => (
                <button
                  key={item}
                  className={barrier === item ? "choice-chip is-selected" : "choice-chip"}
                  type="button"
                  aria-pressed={barrier === item}
                  onClick={() => setBarrier(item)}
                >
                  {barrier === item && <Check size={14} aria-hidden="true" />}
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="range-field">
            <span>
              <strong>How much friction?</strong>
              <output>{friction} · {frictionLabels[friction - 1]}</output>
            </span>
            <input
              type="range"
              min="1"
              max="5"
              value={friction}
              aria-valuetext={`${friction}, ${frictionLabels[friction - 1]}`}
              onChange={(event) => setFriction(Number(event.target.value))}
            />
            <small><span>1 · barely there</span><span>5 · blocking</span></small>
          </label>

          <div className="dialog__actions">
            <button className="button button--ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="button button--primary"
              type="submit"
            >
              What helped? <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </form>
      ) : (
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <h3
            ref={stepHeadingRef}
            className="dialog-step-heading"
            tabIndex={-1}
          >
            Step 2 · What helped?
          </h3>
          <div className="two-column-fields">
            <label className="range-field">
              <span>
                <strong>Capacity before</strong>
                <output>{capacityBefore} · {capacityLabels[capacityBefore - 1]}</output>
              </span>
              <input
                type="range"
                min="1"
                max="5"
                value={capacityBefore}
                aria-valuetext={`${capacityBefore}, ${capacityLabels[capacityBefore - 1]}`}
                onChange={(event) => setCapacityBefore(Number(event.target.value))}
              />
            </label>
            <label className="range-field">
              <span>
                <strong>Capacity after</strong>
                <output>{capacityAfter} · {capacityLabels[capacityAfter - 1]}</output>
              </span>
              <input
                type="range"
                min="1"
                max="5"
                value={capacityAfter}
                aria-valuetext={`${capacityAfter}, ${capacityLabels[capacityAfter - 1]}`}
                onChange={(event) => setCapacityAfter(Number(event.target.value))}
              />
            </label>
          </div>

          <fieldset>
            <legend>Which supports were in place?</legend>
            {availableSupports.length ? (
              <div className="check-list">
                {availableSupports.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={supportIds.includes(item.id)}
                      onChange={() =>
                        setSupportIds((current) =>
                          current.includes(item.id)
                            ? current.filter((id) => id !== item.id)
                            : [...current, item.id]
                        )
                      }
                    />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.status}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="form-hint">No active support experiments yet. That is useful context too.</p>
            )}
          </fieldset>

          <label className="field">
            <span>What happened? <small>Optional</small></span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="A concrete observation, without judging yourself…"
              rows={3}
              maxLength={500}
            />
          </label>

          <label className="field field--warm">
            <span>One thing that went better <small>Optional</small></span>
            <input
              value={win}
              onChange={(event) => setWin(event.target.value)}
              placeholder="A small win, action, or useful clue"
              maxLength={180}
            />
          </label>

          <p className="form-footnote">
            AccessLoom looks for descriptive patterns. It does not infer causes or assess performance.
          </p>

          <div className="dialog__actions">
            <button className="button button--ghost" type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving privately…" : "Save check-in"}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
