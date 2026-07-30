import { useState } from "react";
import {
  ArrowRight,
  Check,
  EyeOff,
  FlaskConical,
  Leaf,
  LockKeyhole,
  Sparkles
} from "lucide-react";
import { Logo } from "./Logo";

interface WelcomeProps {
  onStartDemo: () => Promise<void>;
  onStartFresh: (name: string) => Promise<void>;
}

export function Welcome({ onStartDemo, onStartFresh }: WelcomeProps) {
  const [name, setName] = useState("");
  const [showName, setShowName] = useState(false);
  const [working, setWorking] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setWorking(true);
    try {
      await action();
    } finally {
      setWorking(false);
    }
  };

  return (
    <main id="main-content" className="welcome">
      <nav className="welcome__nav" aria-label="Welcome">
        <Logo />
        <a href="#principles" className="text-link">
          Why local-first?
        </a>
      </nav>

      <section className="welcome__hero">
        <div className="welcome__copy">
          <p className="hero-kicker">
            <Sparkles size={16} aria-hidden="true" /> Free, private, open source
          </p>
          <h1>
            Work should fit
            <span> humans.</span>
          </h1>
          <p className="welcome__lede">
            Notice friction. Try one small support. See what appears to help—then
            weave only chosen findings into a passport you control.
          </p>
          <div className="welcome__actions">
            <button
              className="button button--primary button--large"
              type="button"
              disabled={working}
              onClick={() => run(onStartDemo)}
            >
              Explore the live demo <ArrowRight size={18} aria-hidden="true" />
            </button>
            {!showName ? (
              <button
                className="button button--ghost button--large"
                type="button"
                disabled={working}
                onClick={() => setShowName(true)}
              >
                Start my private workspace
              </button>
            ) : (
              <form
                className="welcome__name-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() => onStartFresh(name.trim()));
                }}
              >
                <label htmlFor="welcome-name">What should we call you? (optional)</label>
                <div>
                  <input
                    id="welcome-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your preferred name"
                    autoFocus
                  />
                  <button className="button button--dark" type="submit" disabled={working}>
                    Begin <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="welcome__trust">
            <span><Check size={15} /> No account</span>
            <span><Check size={15} /> No diagnosis required</span>
            <span><Check size={15} /> No automatic workspace upload</span>
          </div>
        </div>

        <div className="loom-visual" aria-label="A preview of AccessLoom pattern insights">
          <div className="loom-visual__halo" />
          <div className="loom-card loom-card--checkin">
            <span className="loom-card__icon"><Leaf size={18} /></span>
            <div>
              <small>Today’s check-in</small>
              <strong>Meeting load</strong>
            </div>
            <span className="mini-meter"><i /><i /><i className="is-on" /><i className="is-on" /><i /></span>
          </div>
          <div className="loom-card loom-card--pattern">
            <small>Descriptive signal</small>
            <strong>Written agendas preserve capacity</strong>
            <div className="mini-chart" aria-hidden="true">
              <span style={{ height: "72%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "64%" }} />
              <span className="is-accent" style={{ height: "30%" }} />
              <span className="is-accent" style={{ height: "24%" }} />
            </div>
            <p>Descriptive signal across 5 check-ins</p>
          </div>
          <div className="loom-card loom-card--passport">
            <small>My access passport</small>
            <div className="passport-lines" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            <span className="pill pill--peach">3 supports selected</span>
          </div>
          <svg className="loom-threads" viewBox="0 0 640 560" aria-hidden="true">
            <path d="M84 114C190 114 178 252 310 252S448 398 558 398" />
            <path d="M78 402C198 402 194 292 308 292S432 130 558 130" />
          </svg>
        </div>
      </section>

      <section className="welcome__steps" aria-labelledby="steps-heading">
        <div className="section-heading">
          <p className="eyebrow">A gentler feedback loop</p>
          <h2 id="steps-heading">Not another productivity score.</h2>
          <p>AccessLoom looks for fit between a person and their environment—not ways to “fix” the person.</p>
        </div>
        <div className="step-grid">
          <article>
            <span>01</span>
            <EyeOff aria-hidden="true" />
            <h3>Notice privately</h3>
            <p>Log the task, friction, capacity, and any support used in about two minutes.</p>
          </article>
          <article>
            <span>02</span>
            <FlaskConical aria-hidden="true" />
            <h3>Try, don’t promise</h3>
            <p>Turn an idea into a small, time-bounded experiment with a review date.</p>
          </article>
          <article>
            <span>03</span>
            <LockKeyhole aria-hidden="true" />
            <h3>Share selectively</h3>
            <p>Promote only chosen findings into a portable HTML or print-ready passport.</p>
          </article>
        </div>
      </section>

      <section id="principles" className="welcome__principles">
        <div>
          <p className="eyebrow">Your patterns belong to you</p>
          <h2>No cloud has to know how work feels.</h2>
        </div>
        <div className="principle-list">
          <p><strong>Local-first.</strong> Records stay in this browser’s IndexedDB.</p>
          <p><strong>Portable.</strong> Export a complete, versioned backup whenever you want.</p>
          <p><strong>Inspectible.</strong> Every line is licensed AGPLv3 for public scrutiny.</p>
          <p><strong>Non-diagnostic.</strong> The tool describes your observations; it does not make medical or legal claims.</p>
        </div>
      </section>

      <footer className="welcome__footer">
        <Logo compact />
        <p>AccessLoom · AGPL-3.0-only · No telemetry</p>
      </footer>
    </main>
  );
}
