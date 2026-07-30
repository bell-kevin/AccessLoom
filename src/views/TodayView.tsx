import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDashed,
  FlaskConical,
  Lightbulb,
  Plus,
  Sparkles
} from "lucide-react";
import { useRef } from "react";
import { db } from "../db";
import {
  getPatternSummary,
  getRecentDayStats
} from "../lib/analytics";
import { daysUntil, formatLongDate, formatShortDate, relativeDate } from "../lib/date";
import type {
  Adjustment,
  CheckIn,
  Commitment,
  ViewId,
  WorkspaceRecord
} from "../types";

interface TodayViewProps {
  workspace: WorkspaceRecord;
  adjustments: Adjustment[];
  checkIns: CheckIn[];
  commitments: Commitment[];
  onCheckIn: () => void;
  onAddCommitment: () => void;
  onEditSupport: (adjustment: Adjustment) => void;
  onNavigate: (view: ViewId) => void;
  onToast: (message: string) => void;
}

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const experimentProgress = (adjustment: Adjustment): number => {
  if (!adjustment.startedAt || !adjustment.reviewDate) return 12;
  const start = new Date(`${adjustment.startedAt}T00:00:00`).getTime();
  const end = new Date(`${adjustment.reviewDate}T00:00:00`).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  return Math.max(4, Math.min(100, ((now - start) / (end - start)) * 100));
};

export function TodayView({
  workspace,
  adjustments,
  checkIns,
  commitments,
  onCheckIn,
  onAddCommitment,
  onEditSupport,
  onNavigate,
  onToast
}: TodayViewProps) {
  const commitmentHeadingRef = useRef<HTMLHeadingElement>(null);
  const recent = [...checkIns]
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .slice(0, 3);
  const days = getRecentDayStats(checkIns, 7);
  const weekChartLabel = `Average reported friction over the last seven days, where five is highest. ${days
    .map((day) =>
      day.count
        ? `${day.label}: ${day.average} out of 5 from ${day.count} check-in${day.count === 1 ? "" : "s"}`
        : `${day.label}: no check-in`
    )
    .join("; ")}.`;
  const activeExperiment = adjustments
    .filter((item) => item.status === "Trying")
    .sort((a, b) =>
      (a.reviewDate || "9999-12-31").localeCompare(
        b.reviewDate || "9999-12-31"
      )
    )[0];
  const openCommitments = commitments
    .filter((item) => item.status === "Open")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 3);
  const firstName = workspace.profile.preferredName
    ? `, ${workspace.profile.preferredName.split(" ")[0]}`
    : "";
  const pattern = getPatternSummary(checkIns, adjustments);
  const experimentObservations = activeExperiment
    ? checkIns.filter((item) => item.supportIds.includes(activeExperiment.id)).length
    : 0;

  const toggleCommitment = async (commitment: Commitment) => {
    await db.commitments.update(commitment.id, {
      status: commitment.status === "Done" ? "Open" : "Done"
    });
    onToast(commitment.status === "Done" ? "Follow-through reopened." : "Marked complete.");
    window.requestAnimationFrame(() => commitmentHeadingRef.current?.focus());
  };

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="view-date">{formatLongDate(new Date().toISOString())}</p>
          <h1 tabIndex={-1}>{greeting()}{firstName}.</h1>
          <p>What would make today’s work fit a little better?</p>
        </div>
        <button className="button button--primary button--large desktop-only" type="button" onClick={onCheckIn}>
          <Plus size={18} aria-hidden="true" /> New check-in
        </button>
      </header>

      {workspace.isDemo && (
        <aside className="demo-notice">
          <Sparkles size={19} aria-hidden="true" />
          <div>
            <strong>You’re exploring a fictional workspace.</strong>
            <span>Alex’s data demonstrates the full loop. Nothing here is a real person’s health or employment record.</span>
          </div>
        </aside>
      )}

      <section className="today-grid" aria-label="Today overview">
        <article className="card checkin-prompt">
          <div className="checkin-prompt__copy">
            <span className="card-icon card-icon--peach"><CircleDashed size={21} /></span>
            <div>
              <p className="eyebrow">A two-minute observation</p>
              <h2>Notice the fit, not your worth.</h2>
              <p>Capture one concrete moment while the details are still nearby.</p>
            </div>
          </div>
          <button className="button button--dark" type="button" onClick={onCheckIn}>
            Check in now <ArrowRight size={17} aria-hidden="true" />
          </button>
        </article>

        <article className="card week-pulse">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Past seven days</p>
              <h2>Friction pulse</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate("patterns")}>
              Patterns <ChevronRight size={15} />
            </button>
          </div>
          <div className="week-chart" role="img" aria-label={weekChartLabel}>
            {days.map((day) => (
              <div key={day.key} className="week-chart__day">
                <span className="week-chart__track">
                  {day.count > 0 && (
                    <i
                      style={{ height: `${Math.max(14, day.average * 18)}%` }}
                      title={`${day.label}: ${day.average} out of 5`}
                    />
                  )}
                </span>
                <small>{day.label}</small>
              </div>
            ))}
          </div>
          <div className="chart-legend"><span><i /> Logged</span><small>5 = blocking</small></div>
        </article>
      </section>

      <section className="insight-strip" aria-labelledby="pattern-today">
        <span className="insight-strip__icon"><Lightbulb size={22} /></span>
        <div>
          <p className="eyebrow">Your clearest current signal</p>
          <h2 id="pattern-today">{pattern}</h2>
          <p>Patterns describe these entries only. They do not prove cause or predict performance.</p>
        </div>
        <button className="button button--outline" type="button" onClick={() => onNavigate("patterns")}>
          See the evidence
        </button>
      </section>

      <section className="today-lower-grid">
        <div>
          <div className="section-row">
            <div>
              <p className="eyebrow">Support lab</p>
              <h2>Active experiment</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate("supports")}>
              All supports <ChevronRight size={15} />
            </button>
          </div>
          {activeExperiment ? (
            <article className="card experiment-card">
              <div className="experiment-card__top">
                <span className="card-icon card-icon--mint"><FlaskConical size={21} /></span>
                <span className="status status--trying">Trying</span>
              </div>
              <h3>{activeExperiment.title}</h3>
              <p>{activeExperiment.hypothesis || activeExperiment.setup}</p>
              <div className="experiment-progress">
                <span><i style={{ width: `${experimentProgress(activeExperiment)}%` }} /></span>
                <div>
                  <small>Started {activeExperiment.startedAt ? formatShortDate(activeExperiment.startedAt) : "recently"}</small>
                  <small>
                    {activeExperiment.reviewDate
                      ? `Review ${relativeDate(activeExperiment.reviewDate)}`
                      : "Add a review date"}
                  </small>
                </div>
              </div>
              <div className="experiment-card__meta">
                <span><strong>{experimentObservations}</strong> observations</span>
                <span><strong>{activeExperiment.effectiveness || "—"}</strong> / 5 helpful</span>
              </div>
              <button className="button button--soft button--full" type="button" onClick={() => onEditSupport(activeExperiment)}>
                Review experiment
              </button>
            </article>
          ) : (
            <article className="card empty-card">
              <FlaskConical size={28} aria-hidden="true" />
              <h3>No experiment running</h3>
              <p>Choose one small support to try for a defined period.</p>
              <button className="button button--soft" type="button" onClick={() => onNavigate("supports")}>Visit the support lab</button>
            </article>
          )}
        </div>

        <div>
          <div className="section-row">
            <div>
              <p className="eyebrow">Follow-through</p>
              <h2 ref={commitmentHeadingRef} tabIndex={-1}>Promises with owners</h2>
            </div>
            <button className="text-button" type="button" onClick={onAddCommitment}>
              <Plus size={15} /> Add
            </button>
          </div>
          <div className="card commitment-list">
            {openCommitments.length ? openCommitments.map((item) => (
              <button
                className="commitment-row"
                type="button"
                key={item.id}
                aria-label={`Mark ${item.title} complete`}
                onClick={() => void toggleCommitment(item)}
              >
                <span className="commitment-check"><Check size={15} /></span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.owner}{item.dueDate ? ` · ${relativeDate(item.dueDate)}` : ""}</small>
                </span>
                {item.dueDate && daysUntil(item.dueDate) < 0 && <span className="status status--due">Due</span>}
              </button>
            )) : (
              <div className="empty-inline">
                <Check size={20} />
                <p><strong>Nothing waiting.</strong><span>Capture who will do what after your next conversation.</span></p>
              </div>
            )}
            <button className="commitment-add" type="button" onClick={onAddCommitment}>
              <Plus size={16} /> Capture a follow-through
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="section-row">
          <div>
            <p className="eyebrow">Private daybook</p>
            <h2>Recent check-ins</h2>
          </div>
          <span className="local-label">Stored only here</span>
        </div>
        {recent.length ? (
          <div className="recent-grid">
            {recent.map((item) => (
              <article className="card recent-card" key={item.id}>
                <div>
                  <span className="status status--neutral">{item.context}</span>
                  <small>{formatShortDate(item.recordedAt)}</small>
                </div>
                <h3>{item.activity}</h3>
                <p>{item.note || item.win || "Observation saved without a note."}</p>
                <footer>
                  <span>Friction <strong>{item.friction}/5</strong></span>
                  <span>Capacity <strong>{item.capacityBefore} → {item.capacityAfter}</strong></span>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <article className="card empty-card empty-card--wide">
            <CalendarClock size={28} />
            <h3>Your daybook is ready.</h3>
            <p>Your first check-in can be tiny: one moment, one barrier, one observation.</p>
            <button className="button button--primary" type="button" onClick={onCheckIn}>Add the first check-in</button>
          </article>
        )}
      </section>
    </div>
  );
}
