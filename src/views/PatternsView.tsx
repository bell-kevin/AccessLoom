import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  ChevronDown,
  Info,
  Layers3,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { db } from "../db";
import {
  getBarrierStats,
  getPatternSummary,
  getSupportComparisons,
  getSupportStats
} from "../lib/analytics";
import { formatLongDate } from "../lib/date";
import type { Adjustment, BarrierCategory, CheckIn } from "../types";

interface PatternsViewProps {
  checkIns: CheckIn[];
  adjustments: Adjustment[];
  onCheckIn: () => void;
}

const capacityWord = (value: number): string => {
  if (value >= 1) return "rose";
  if (value <= -1) return "fell";
  return "held";
};

export function PatternsView({
  checkIns,
  adjustments,
  onCheckIn
}: PatternsViewProps) {
  const [filter, setFilter] = useState<BarrierCategory | "All">("All");
  const barriers = useMemo(() => getBarrierStats(checkIns), [checkIns]);
  const supportStats = useMemo(
    () => getSupportStats(checkIns, adjustments),
    [checkIns, adjustments]
  );
  const comparisons = useMemo(
    () => getSupportComparisons(checkIns, adjustments),
    [checkIns, adjustments]
  );
  const maxBarrierScore = Math.max(
    1,
    ...barriers.map((item) => item.count * item.averageFriction)
  );
  const filtered = [...checkIns]
    .filter((item) => filter === "All" || item.barrier === filter)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  const deleteCheckIn = async (checkIn: CheckIn) => {
    const confirmed = window.confirm(
      `Delete the check-in “${checkIn.activity}”? It will be removed from every pattern and passport aggregate. This cannot be undone without a backup.`
    );
    if (!confirmed) return;
    await db.checkIns.delete(checkIn.id);
  };

  return (
    <div className="view patterns-view">
      <header className="view-header">
        <div>
          <p className="view-date">Transparent, on-device summaries</p>
          <h1 tabIndex={-1}>Your patterns, in context.</h1>
          <p>Clues from what you recorded—not a diagnosis, judgment, or productivity score.</p>
        </div>
        <button className="button button--primary desktop-only" type="button" onClick={onCheckIn}>
          Add an observation <ArrowRight size={17} />
        </button>
      </header>

      <section className="pattern-hero">
        <div className="pattern-hero__orb">
          <Activity size={32} aria-hidden="true" />
          <strong>{checkIns.length}</strong>
          <span>observations</span>
        </div>
        <div>
          <p className="eyebrow">Current read</p>
          <h2>{getPatternSummary(checkIns, adjustments)}</h2>
          <p>
            Every number below shows its sample size. A lower friction score alongside a support
            is an association in your entries, not proof that the support caused the change.
          </p>
        </div>
      </section>

      {checkIns.length < 3 ? (
        <article className="card empty-card empty-card--wide">
          <Layers3 size={30} />
          <h2>A pattern needs a few threads.</h2>
          <p>Add {3 - checkIns.length} more check-in{3 - checkIns.length === 1 ? "" : "s"} to unlock the first summary.</p>
          <button className="button button--primary" type="button" onClick={onCheckIn}>Add a check-in</button>
        </article>
      ) : (
        <>
          <section aria-labelledby="comparison-heading">
            <div className="section-row">
              <div>
                <p className="eyebrow">Comparable moments</p>
                <h2 id="comparison-heading">Signals around your supports</h2>
              </div>
              <span className="method-chip"><Info size={14} /> One matched context</span>
            </div>

            {comparisons.length ? (
              <div className="comparison-grid">
                {comparisons.slice(0, 3).map((item) => {
                  const adjustment = adjustments.find((value) => value.id === item.id);
                  const improved = item.difference > 0;
                  return (
                    <article className="card comparison-card" key={item.id}>
                      <div className="comparison-card__top">
                        <span className={`signal signal--${item.confidence.toLowerCase().replaceAll(" ", "-")}`}>
                          {item.confidence}
                        </span>
                        <small title={item.windowLabel}>
                          {adjustment?.barrier} · {item.context}
                        </small>
                      </div>
                      <h3>{item.title}</h3>
                      {item.confidence === "Not comparable yet" ? (
                        <p className="comparison-card__empty">
                          Add a check-in from the same friction area and work context without this support to create a comparison.
                        </p>
                      ) : (
                        <>
                          <div className="comparison-bars">
                            <div>
                              <span><strong>{item.withFriction}</strong> / 5</span>
                              <i><b style={{ width: `${item.withFriction * 20}%` }} /></i>
                              <small>With support · n={item.withCount}</small>
                            </div>
                            <div>
                              <span><strong>{item.withoutFriction}</strong> / 5</span>
                              <i><b className="is-muted" style={{ width: `${item.withoutFriction * 20}%` }} /></i>
                              <small>Without · n={item.withoutCount}</small>
                            </div>
                          </div>
                          <p className={improved ? "comparison-note is-positive" : "comparison-note"}>
                            {improved && <ArrowDown size={16} />}
                            {improved
                              ? `${item.difference} points lower friction was reported alongside this support.`
                              : item.difference === 0
                                ? "Reported friction was the same in this small sample."
                                : `${Math.abs(item.difference)} points higher friction was reported alongside this support.`}
                          </p>
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <article className="card empty-inline-card">
                <BarChart3 size={25} />
                <div>
                  <h3>No support comparison yet</h3>
                  <p>Use an active support in a check-in and AccessLoom will compare the same friction area and work context.</p>
                </div>
              </article>
            )}
            <p className="comparison-method">
              Each card uses the support’s most-recorded work context. If a trial
              start exists, no-support entries may come from the prior 28 days or
              the trial itself; entries stop at the review date or today. Other
              contexts and dates stay out of that comparison.
            </p>
          </section>

          <section className="pattern-two-column">
            <article className="card barrier-map">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">Frequency × intensity</p>
                  <h2>Friction map</h2>
                </div>
                <Layers3 size={21} aria-hidden="true" />
              </div>
              <div className="barrier-list">
                {barriers.map((item, index) => (
                  <button
                    key={item.barrier}
                    type="button"
                    onClick={() => setFilter(item.barrier)}
                    className={filter === item.barrier ? "is-selected" : ""}
                    aria-pressed={filter === item.barrier}
                  >
                    <span className="barrier-rank">{String(index + 1).padStart(2, "0")}</span>
                    <span className="barrier-data">
                      <span><strong>{item.barrier}</strong><small>{item.count} logged · avg {item.averageFriction}/5</small></span>
                      <i><b style={{ width: `${(item.count * item.averageFriction / maxBarrierScore) * 100}%` }} /></i>
                    </span>
                    <span className={`capacity-delta ${item.capacityChange >= 0 ? "is-up" : ""}`}>
                      {item.capacityChange > 0 ? "+" : ""}{item.capacityChange}
                      <small>capacity</small>
                    </span>
                  </button>
                ))}
              </div>
            </article>

            <article className="card support-signal-list">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">Across your check-ins</p>
                  <h2>Support signals</h2>
                </div>
                <ShieldCheck size={21} aria-hidden="true" />
              </div>
              {supportStats.filter((item) => item.uses > 0).map((item) => (
                <div className="support-signal-row" key={item.id}>
                  <span className={`signal-dot signal-dot--${item.signal.toLowerCase().replaceAll(" ", "-")}`} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.uses} use{item.uses === 1 ? "" : "s"} · capacity {capacityWord(item.averageCapacityChange)}</small>
                  </span>
                  <span className="signal-label">{item.signal}</span>
                </div>
              ))}
              {!supportStats.some((item) => item.uses > 0) && (
                <div className="empty-inline">
                  <Activity size={20} />
                  <p><strong>No active signals yet.</strong><span>Select a support when you check in.</span></p>
                </div>
              )}
              <footer className="method-note">
                “Promising” requires at least two matched uses, one matched
                no-support entry, average friction at least 0.5 points lower with
                the support, and no large average capacity drop.
              </footer>
            </article>
          </section>
        </>
      )}

      <section aria-labelledby="daybook-heading">
        <div className="section-row section-row--wrap">
          <div>
            <p className="eyebrow">The observations underneath</p>
            <h2 id="daybook-heading">Private daybook</h2>
          </div>
          <label className="filter-select">
            <span className="sr-only">Filter by friction area</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as BarrierCategory | "All")}>
              <option>All</option>
              {barriers.map((item) => <option key={item.barrier}>{item.barrier}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </label>
        </div>
        <div className="daybook-table">
          {filtered.map((item) => (
            <details key={item.id}>
              <summary>
                <span className="daybook-date">{formatLongDate(item.recordedAt)}</span>
                <span><strong>{item.activity}</strong><small>{item.context} · {item.barrier}</small></span>
                <span className="daybook-metrics"><b>{item.friction}/5</b><small>friction</small></span>
              </summary>
              <div className="daybook-detail">
                <p><strong>Observation</strong>{item.note || "No private note added."}</p>
                <p><strong>What went better</strong>{item.win || "No win captured."}</p>
                <p><strong>Supports in place</strong>{item.supportLabels.length ? item.supportLabels.join(", ") : "None selected"}</p>
                <p><strong>Capacity</strong>{item.capacityBefore} before → {item.capacityAfter} after</p>
                <div className="daybook-actions">
                  <button
                    className="button button--danger button--small"
                    type="button"
                    onClick={() => void deleteCheckIn(item)}
                  >
                    <Trash2 size={14} /> Delete this check-in
                  </button>
                </div>
              </div>
            </details>
          ))}
          {!filtered.length && <p className="table-empty">No check-ins match this filter.</p>}
        </div>
      </section>
    </div>
  );
}
