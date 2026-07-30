import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  PencilLine,
  Printer,
  Save,
  ShieldCheck
} from "lucide-react";
import { db } from "../db";
import {
  buildPassportText,
  downloadPassportHtml,
  getShareableSupportDetails,
  saveWorkspacePreferences
} from "../lib/portable";
import type {
  Adjustment,
  CheckIn,
  PassportProfile,
  PassportSections,
  WorkspaceRecord
} from "../types";

interface PassportViewProps {
  workspace: WorkspaceRecord;
  adjustments: Adjustment[];
  checkIns: CheckIn[];
  onToast: (message: string) => void;
}

const toLines = (values: string[]): string => values.join("\n");
const fromLines = (value: string): string[] =>
  value.split("\n").map((item) => item.trim()).filter(Boolean);

const sectionLabels: Array<{ key: keyof PassportSections; label: string }> = [
  { key: "introduction", label: "How I work best" },
  { key: "strengths", label: "Strengths I bring" },
  { key: "communication", label: "Communication that helps" },
  { key: "workingConditions", label: "Working conditions" },
  { key: "adjustments", label: "Selected supports" },
  { key: "difficultDayPlan", label: "When capacity changes" },
  { key: "reviewTriggers", label: "When to review" }
];

export function PassportView({
  workspace,
  adjustments,
  checkIns,
  onToast
}: PassportViewProps) {
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [profile, setProfile] = useState<PassportProfile>(workspace.profile);
  const [sections, setSections] = useState<PassportSections>(workspace.passportSections);
  const [strengths, setStrengths] = useState(toLines(workspace.profile.strengths));
  const [communication, setCommunication] = useState(toLines(workspace.profile.communication));
  const [workingConditions, setWorkingConditions] = useState(toLines(workspace.profile.workingConditions));
  const [saving, setSaving] = useState(false);
  const [focusPreviewAfterSave, setFocusPreviewAfterSave] = useState(false);
  const previewHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setProfile(workspace.profile);
    setSections(workspace.passportSections);
    setStrengths(toLines(workspace.profile.strengths));
    setCommunication(toLines(workspace.profile.communication));
    setWorkingConditions(toLines(workspace.profile.workingConditions));
  }, [workspace]);

  useEffect(() => {
    if (mode !== "preview" || !focusPreviewAfterSave) return;
    previewHeadingRef.current?.focus();
    setFocusPreviewAfterSave(false);
  }, [focusPreviewAfterSave, mode]);

  const sharedSupports = useMemo(
    () => adjustments.filter((item) => item.includeInPassport),
    [adjustments]
  );

  const compiledProfile: PassportProfile = {
    ...profile,
    strengths: fromLines(strengths),
    communication: fromLines(communication),
    workingConditions: fromLines(workingConditions)
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveWorkspacePreferences(compiledProfile, sections);
      onToast("Passport choices saved locally.");
      setFocusPreviewAfterSave(true);
      setMode("preview");
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(
      buildPassportText(
        { ...workspace, profile: compiledProfile, passportSections: sections },
        adjustments,
        checkIns
      )
    );
    onToast("Passport copied as plain text.");
  };

  const download = () => {
    downloadPassportHtml(
      { ...workspace, profile: compiledProfile, passportSections: sections },
      adjustments,
      checkIns
    );
    onToast("Portable passport downloaded.");
  };

  const toggleSupport = async (item: Adjustment) => {
    await db.adjustments.update(item.id, {
      includeInPassport: !item.includeInPassport,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="view passport-view">
      <header className="view-header">
        <div>
          <p className="view-date">Selective by design</p>
          <h1 tabIndex={-1}>Your access passport.</h1>
          <p>A small, practical document about what helps—not your private daybook.</p>
        </div>
        <div className="passport-mode-toggle" role="group" aria-label="Passport mode">
          <button
            type="button"
            className={mode === "edit" ? "is-active" : ""}
            aria-pressed={mode === "edit"}
            onClick={() => setMode("edit")}
          >
            <PencilLine size={16} /> Edit
          </button>
          <button
            type="button"
            className={mode === "preview" ? "is-active" : ""}
            aria-pressed={mode === "preview"}
            onClick={() => setMode("preview")}
          >
            <Eye size={16} /> Preview
          </button>
        </div>
      </header>

      <aside className="privacy-boundary">
        <LockKeyhole size={22} aria-hidden="true" />
        <div>
          <strong>A hard line between private and shareable.</strong>
          <span>Check-ins, raw pattern data, private notes, and any diagnosis are never included automatically.</span>
        </div>
        <span className="pill pill--mint"><ShieldCheck size={14} /> You choose</span>
      </aside>

      {mode === "edit" ? (
        <div className="passport-editor-layout">
          <section className="card passport-form" aria-labelledby="passport-form-heading">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Your words</p>
                <h2 id="passport-form-heading">What should someone understand?</h2>
              </div>
            </div>

            <div className="form-stack">
              <div className="two-column-fields">
                <label className="field">
                  <span>Preferred name</span>
                  <input
                    value={profile.preferredName}
                    onChange={(event) => setProfile({ ...profile, preferredName: event.target.value })}
                    maxLength={80}
                  />
                </label>
                <label className="field">
                  <span>Role or context <small>Optional</small></span>
                  <input
                    value={profile.roleContext}
                    onChange={(event) => setProfile({ ...profile, roleContext: event.target.value })}
                    placeholder="e.g. Designer in a hybrid team"
                    maxLength={120}
                  />
                </label>
              </div>

              <label className="field">
                <span>How I work best</span>
                <textarea
                  value={profile.introduction}
                  onChange={(event) => setProfile({ ...profile, introduction: event.target.value })}
                  rows={3}
                  placeholder="A short, human introduction…"
                  maxLength={500}
                />
              </label>

              <div className="two-column-fields">
                <label className="field">
                  <span>Strengths I bring <small>One per line</small></span>
                  <textarea value={strengths} onChange={(event) => setStrengths(event.target.value)} rows={5} />
                </label>
                <label className="field">
                  <span>Communication that helps <small>One per line</small></span>
                  <textarea value={communication} onChange={(event) => setCommunication(event.target.value)} rows={5} />
                </label>
              </div>

              <label className="field">
                <span>Working conditions <small>One per line</small></span>
                <textarea value={workingConditions} onChange={(event) => setWorkingConditions(event.target.value)} rows={4} />
              </label>

              <label className="field">
                <span>When capacity changes</span>
                <textarea
                  value={profile.difficultDayPlan}
                  onChange={(event) => setProfile({ ...profile, difficultDayPlan: event.target.value })}
                  rows={3}
                  placeholder="What is useful if today becomes a difficult day?"
                  maxLength={600}
                />
              </label>

              <label className="field">
                <span>When should this be reviewed?</span>
                <textarea
                  value={profile.reviewTriggers}
                  onChange={(event) => setProfile({ ...profile, reviewTriggers: event.target.value })}
                  rows={2}
                  placeholder="e.g. After a change in role, manager, location, or needs"
                  maxLength={400}
                />
              </label>
            </div>
          </section>

          <aside className="passport-controls">
            <section className="card">
              <p className="eyebrow">Sections</p>
              <h2>Choose what appears</h2>
              <div className="section-checks">
                {sectionLabels.map((item) => (
                  <label key={item.key}>
                    <input
                      type="checkbox"
                      checked={sections[item.key]}
                      onChange={(event) => setSections({ ...sections, [item.key]: event.target.checked })}
                    />
                    <span>{sections[item.key] ? <Eye size={16} /> : <EyeOff size={16} />}{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card">
              <p className="eyebrow">Support boundary</p>
              <h2>{sharedSupports.length} selected to share</h2>
              <p className="passport-picker-note">
                A selected support shares its setup, status, success marker,
                personal rating, and an aggregate observation summary with counts
                and averages. Private notes and individual check-ins stay out.
              </p>
              <div className="passport-support-picker">
                {adjustments.map((item) => (
                  <label key={item.id}>
                    <input type="checkbox" checked={item.includeInPassport} onChange={() => void toggleSupport(item)} />
                    <span><strong>{item.title}</strong><small>{item.status}</small></span>
                  </label>
                ))}
                {!adjustments.length && <p>No support ideas yet. Add them in the support lab.</p>}
              </div>
            </section>

            <button className="button button--primary button--full" type="button" disabled={saving} onClick={() => void save()}>
              <Save size={17} /> {saving ? "Saving…" : "Save and preview"}
            </button>
          </aside>
        </div>
      ) : (
        <>
          <div className="passport-actions" aria-label="Passport actions">
            <button className="button button--outline" type="button" onClick={() => void copy()}>
              <Copy size={16} /> Copy text
            </button>
            <button className="button button--outline" type="button" onClick={download}>
              <Download size={16} /> Download HTML
            </button>
            <button className="button button--dark" type="button" onClick={() => window.print()}>
              <Printer size={16} /> Print or save PDF
            </button>
          </div>

          <article className="passport-document" aria-label="Access passport preview">
            <header>
              <div>
                <p className="eyebrow">Personal access passport</p>
                <h2 ref={previewHeadingRef} tabIndex={-1}>
                  {compiledProfile.preferredName || "My passport"}
                </h2>
                {compiledProfile.roleContext && <p>{compiledProfile.roleContext}</p>}
              </div>
              <div className="passport-seal">
                <FileText size={23} />
                <span>Prepared</span>
                <strong>{new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(new Date())}</strong>
              </div>
            </header>

            {sections.introduction && compiledProfile.introduction && (
              <section className="passport-intro">
                <p className="eyebrow">How I work best</p>
                <blockquote>{compiledProfile.introduction}</blockquote>
              </section>
            )}

            <div className="passport-columns">
              {sections.strengths && (
                <section>
                  <p className="eyebrow">Strengths I bring</p>
                  <ul>{compiledProfile.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              )}
              {sections.communication && (
                <section>
                  <p className="eyebrow">Communication that helps</p>
                  <ul>{compiledProfile.communication.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              )}
            </div>

            {sections.workingConditions && (
              <section>
                <p className="eyebrow">Working conditions</p>
                <div className="passport-tags">
                  {compiledProfile.workingConditions.map((item) => <span key={item}>{item}</span>)}
                </div>
              </section>
            )}

            {sections.adjustments && (
              <section>
                <p className="eyebrow">Supports to put in place</p>
                <div className="passport-adjustments">
                  {sharedSupports.map((item, index) => {
                    const details = getShareableSupportDetails(item, checkIns);
                    return (
                      <div key={item.id}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p>
                          <strong>{details.title}</strong>
                          {details.setup}
                          {details.successMarker && (
                            <span className="passport-evidence">
                              <b>Success marker:</b> {details.successMarker}
                            </span>
                          )}
                          {details.personalReview && (
                            <span className="passport-evidence">
                              <b>Personal review:</b> {details.personalReview}
                            </span>
                          )}
                          {details.observationSummary && (
                            <span className="passport-evidence">
                              <b>Observed summary:</b> {details.observationSummary}
                            </span>
                          )}
                        </p>
                        <small>{details.status}</small>
                      </div>
                    );
                  })}
                  {!sharedSupports.length && <p className="passport-empty">No supports selected yet.</p>}
                </div>
                {sharedSupports.length > 0 && (
                  <p className="passport-method-note">
                    These aggregates describe self-recorded associations; they do not
                    prove that a support caused a change.
                  </p>
                )}
              </section>
            )}

            <div className="passport-columns passport-columns--bottom">
              {sections.difficultDayPlan && compiledProfile.difficultDayPlan && (
                <section>
                  <p className="eyebrow">When capacity changes</p>
                  <p>{compiledProfile.difficultDayPlan}</p>
                </section>
              )}
              {sections.reviewTriggers && compiledProfile.reviewTriggers && (
                <section>
                  <p className="eyebrow">When to review this</p>
                  <p>{compiledProfile.reviewTriggers}</p>
                </section>
              )}
            </div>

            <footer>
              <ShieldCheck size={18} />
              <p>
                This is a communication aid owned by the person named above. It is not a
                medical record, legal determination, or automatic approval of an accommodation.
              </p>
              <span>Made privately with AccessLoom</span>
            </footer>
          </article>
        </>
      )}
    </div>
  );
}
