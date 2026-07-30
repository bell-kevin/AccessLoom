import { useMemo, useRef, useState } from "react";
import {
  Check,
  Clipboard,
  Copy,
  FlaskConical,
  Lightbulb,
  MessageSquareText,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Trash2
} from "lucide-react";
import { db } from "../db";
import { supportSuggestions } from "../data/suggestions";
import { getBarrierStats, getSupportStats } from "../lib/analytics";
import { daysUntil, relativeDate } from "../lib/date";
import type {
  Adjustment,
  CheckIn,
  Commitment,
  SupportStatus,
  SupportSuggestion
} from "../types";
import { Dialog } from "../components/ui/Dialog";

interface SupportsViewProps {
  adjustments: Adjustment[];
  checkIns: CheckIn[];
  commitments: Commitment[];
  onAdd: (initial?: Partial<Adjustment>) => void;
  onEdit: (adjustment: Adjustment) => void;
  onAddCommitment: (adjustmentId?: string) => void;
  onToast: (message: string) => void;
}

const filters: Array<SupportStatus | "All"> = [
  "All",
  "Idea",
  "Trying",
  "Helpful",
  "Agreed",
  "Paused"
];

const statusClass = (status: SupportStatus): string =>
  `status status--${status.toLowerCase()}`;

export function SupportsView({
  adjustments,
  checkIns,
  commitments,
  onAdd,
  onEdit,
  onAddCommitment,
  onToast
}: SupportsViewProps) {
  const [filter, setFilter] = useState<SupportStatus | "All">("All");
  const [composer, setComposer] = useState<Adjustment | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const ledgerHeadingRef = useRef<HTMLHeadingElement>(null);
  const stats = useMemo(
    () => getSupportStats(checkIns, adjustments),
    [checkIns, adjustments]
  );
  const topBarriers = getBarrierStats(checkIns).slice(0, 2).map((item) => item.barrier);
  const suggestions = [...supportSuggestions]
    .sort((a, b) => Number(topBarriers.includes(b.barrier)) - Number(topBarriers.includes(a.barrier)))
    .slice(0, 6);
  const visible =
    filter === "All"
      ? adjustments
      : adjustments.filter((item) => item.status === filter);
  const openCommitments = commitments
    .filter((item) => item.status === "Open")
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  const completedCommitments = commitments
    .filter((item) => item.status === "Done")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visibleCommitments = showCompleted
    ? [...openCommitments, ...completedCommitments]
    : openCommitments;

  const addSuggestion = (suggestion: SupportSuggestion) => {
    onAdd({
      title: suggestion.title,
      barrier: suggestion.barrier,
      setup: suggestion.setup,
      hypothesis: suggestion.hypothesis,
      status: "Idea"
    });
  };

  const togglePassport = async (adjustment: Adjustment) => {
    await db.adjustments.update(adjustment.id, {
      includeInPassport: !adjustment.includeInPassport,
      updatedAt: new Date().toISOString()
    });
    onToast(
      adjustment.includeInPassport
        ? "Removed from the shareable passport."
        : "Selected for the shareable passport."
    );
  };

  const toggleCommitment = async (commitment: Commitment) => {
    await db.commitments.update(commitment.id, {
      status: commitment.status === "Done" ? "Open" : "Done"
    });
    onToast(
      commitment.status === "Done"
        ? "Follow-through reopened."
        : "Follow-through marked complete."
    );
    window.requestAnimationFrame(() => ledgerHeadingRef.current?.focus());
  };

  const deleteCommitment = async (commitment: Commitment) => {
    const confirmed = window.confirm(
      `Delete the follow-through “${commitment.title}”? This cannot be undone without a backup.`
    );
    if (!confirmed) return;
    await db.commitments.delete(commitment.id);
    onToast("Follow-through deleted.");
    window.requestAnimationFrame(() => ledgerHeadingRef.current?.focus());
  };

  const conversationText = composer
    ? `I’d like to discuss a practical support: ${composer.title}.

The workplace friction I’m trying to reduce is ${composer.barrier.toLowerCase()}.

A concrete trial would be: ${composer.setup}

${composer.hypothesis ? `Why this may help: ${composer.hypothesis}` : ""}

${composer.successLooksLike ? `A useful result would look like: ${composer.successLooksLike}` : ""}

Could we try this${composer.reviewDate ? ` until ${new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(`${composer.reviewDate}T00:00:00`))}` : " for a defined period"}, then review what happened together?`
    : "";

  const copyConversation = async () => {
    await navigator.clipboard.writeText(conversationText);
    onToast("Conversation note copied.");
  };

  return (
    <div className="view supports-view">
      <header className="view-header">
        <div>
          <p className="view-date">Small trials, visible follow-through</p>
          <h1 tabIndex={-1}>The support lab.</h1>
          <p>Turn “maybe this would help” into a concrete experiment you can review.</p>
        </div>
        <button className="button button--primary" type="button" onClick={() => onAdd()}>
          <Plus size={18} /> Add a support
        </button>
      </header>

      <section className="support-principle">
        <span><FlaskConical size={24} /></span>
        <div>
          <p className="eyebrow">The AccessLoom loop</p>
          <h2>Idea → small trial → observed pattern → keep, change, or stop.</h2>
        </div>
        <p>Nothing becomes shareable until you choose it.</p>
      </section>

      <section aria-labelledby="support-list-heading">
        <div className="section-row section-row--wrap">
          <div>
            <p className="eyebrow">{adjustments.length} in your lab</p>
            <h2 id="support-list-heading">Supports and experiments</h2>
          </div>
          <div className="filter-tabs" role="group" aria-label="Filter supports by status">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? "is-active" : ""}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {visible.length ? (
          <div className="support-grid">
            {visible.map((item) => {
              const stat = stats.find((value) => value.id === item.id);
              const relatedCommitments = openCommitments.filter(
                (value) => value.adjustmentId === item.id
              ).length;
              return (
                <article className={`card support-card support-card--${item.status.toLowerCase()}`} key={item.id}>
                  <div className="support-card__head">
                    <span className={statusClass(item.status)}>{item.status}</span>
                    <span className="support-card__barrier">{item.barrier}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.setup}</p>
                  {item.status === "Trying" && item.reviewDate && (
                    <div className="review-ribbon">
                      <RotateCcw size={15} />
                      Review {relativeDate(item.reviewDate)}
                      {daysUntil(item.reviewDate) < 0 && <strong>overdue</strong>}
                    </div>
                  )}
                  <div className="support-card__signals">
                    <span>
                      <strong>{stat?.uses ?? 0}</strong>
                      <small>check-ins</small>
                    </span>
                    <span>
                      <strong>{item.effectiveness || "—"}</strong>
                      <small>helpful / 5</small>
                    </span>
                    <span>
                      <strong>{relatedCommitments}</strong>
                      <small>open actions</small>
                    </span>
                  </div>
                  <div className="support-card__passport">
                    <button
                      type="button"
                      className={item.includeInPassport ? "passport-toggle is-selected" : "passport-toggle"}
                      aria-pressed={item.includeInPassport}
                      onClick={() => void togglePassport(item)}
                    >
                      <span>{item.includeInPassport ? <Check size={14} /> : <Plus size={14} />}</span>
                      {item.includeInPassport ? "In my passport" : "Add to passport"}
                    </button>
                  </div>
                  <footer>
                    <button className="text-button" type="button" onClick={() => onEdit(item)}>Review or edit</button>
                    <button className="icon-text-button" type="button" onClick={() => setComposer(item)}>
                      <MessageSquareText size={16} /> Prepare ask
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <article className="card empty-card empty-card--wide">
            <FlaskConical size={29} />
            <h3>No supports in this view.</h3>
            <p>Start with an idea below or change the status filter.</p>
          </article>
        )}
      </section>

      <section className="idea-library" aria-labelledby="idea-heading">
        <div className="section-row">
          <div>
            <p className="eyebrow">A starting point, never a prescription</p>
            <h2 id="idea-heading">Ideas worth adapting</h2>
          </div>
          <span className="method-chip"><Sparkles size={14} /> Based on common barriers</span>
        </div>
        <div className="idea-scroll">
          {suggestions.map((suggestion) => (
            <article key={suggestion.title}>
              <span><Lightbulb size={19} /></span>
              <small>{suggestion.barrier}</small>
              <h3>{suggestion.title}</h3>
              <p>{suggestion.setup}</p>
              <button type="button" onClick={() => addSuggestion(suggestion)}>
                Add to my lab <Plus size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="follow-heading">
        <div className="section-row">
          <div>
            <p className="eyebrow">Agreements that survive the meeting</p>
            <h2 id="follow-heading" ref={ledgerHeadingRef} tabIndex={-1}>
              Follow-through ledger
            </h2>
          </div>
          <div className="ledger-actions">
            {completedCommitments.length > 0 && (
              <button
                className="button button--soft button--small"
                type="button"
                aria-pressed={showCompleted}
                onClick={() => setShowCompleted((value) => !value)}
              >
                {showCompleted ? "Hide" : "Show"} completed ({completedCommitments.length})
              </button>
            )}
            <button className="button button--outline button--small" type="button" onClick={() => onAddCommitment()}>
              <Plus size={15} /> Add
            </button>
          </div>
        </div>
        <div className="card ledger">
          <table className="ledger__table">
            <caption className="sr-only">
              Follow-through actions with their owner, due date, and completion control
            </caption>
            <thead>
              <tr>
                <th scope="col">Action</th>
                <th scope="col">Owner</th>
                <th scope="col">When</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleCommitments.length ? visibleCommitments.map((item) => {
                const support = adjustments.find((value) => value.id === item.adjustmentId);
                return (
                  <tr className={`ledger__row ${item.status === "Done" ? "is-done" : ""}`} key={item.id}>
                    <td className="ledger__action" data-label="Action">
                      <strong>{item.title}</strong>
                      {support && <small>{support.title}</small>}
                      {item.notes && <small className="ledger__note">{item.notes}</small>}
                    </td>
                    <td data-label="Owner">{item.owner}</td>
                    <td
                      data-label="When"
                      className={item.dueDate && daysUntil(item.dueDate) < 0 ? "is-overdue" : ""}
                    >
                      {item.status === "Done"
                        ? "Completed"
                        : item.dueDate
                          ? relativeDate(item.dueDate)
                          : "No date"}
                    </td>
                    <td className="ledger__control">
                      <div>
                        <button
                          type="button"
                          onClick={() => void toggleCommitment(item)}
                          aria-label={
                            item.status === "Done"
                              ? `Reopen ${item.title}`
                              : `Mark ${item.title} complete`
                          }
                        >
                          {item.status === "Done"
                            ? <RotateCcw size={15} />
                            : <Check size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteCommitment(item)}
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-inline ledger__empty">
                      <Clipboard size={21} />
                      <p><strong>No open follow-through.</strong><span>Record the next practical step, its owner, and a date.</span></p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={Boolean(composer)}
        onClose={() => setComposer(null)}
        title="Prepare a practical conversation"
        description="This draft uses plain language and stays on your device. Edit it after copying to fit your situation."
        wide
      >
        {composer && (
          <div className="conversation-builder">
            <div className="conversation-builder__support">
              <Send size={20} />
              <span><small>About</small><strong>{composer.title}</strong></span>
            </div>
            <textarea readOnly value={conversationText} rows={15} aria-label="Conversation draft" />
            <aside>
              <strong>Keep control of disclosure.</strong>
              <span>This draft describes a barrier and a practical change. It does not add a diagnosis or raw check-in notes.</span>
            </aside>
            <div className="dialog__actions">
              <button className="button button--ghost" type="button" onClick={() => setComposer(null)}>Close</button>
              <button className="button button--primary" type="button" onClick={() => void copyConversation()}>
                <Copy size={16} /> Copy draft
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
