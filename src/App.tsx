import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check } from "lucide-react";
import { AdjustmentDialog } from "./components/AdjustmentDialog";
import { AppShell } from "./components/AppShell";
import { CheckInDialog } from "./components/CheckInDialog";
import { CommitmentDialog } from "./components/CommitmentDialog";
import { PwaUpdateToast } from "./components/PwaUpdateToast";
import { SettingsPanel } from "./components/SettingsPanel";
import { Welcome } from "./components/Welcome";
import { db, initializeDemoWorkspace, initializeFreshWorkspace } from "./db";
import type { Adjustment, DisplayPreferences, ViewId } from "./types";
import { PassportView } from "./views/PassportView";
import { PatternsView } from "./views/PatternsView";
import { SupportsView } from "./views/SupportsView";
import { TodayView } from "./views/TodayView";

const validViews: ViewId[] = ["today", "patterns", "supports", "passport"];

const viewFromHash = (): ViewId => {
  const candidate = window.location.hash.replace("#/", "") as ViewId;
  return validViews.includes(candidate) ? candidate : "today";
};

const defaultPreferences: DisplayPreferences = {
  textScale: "default",
  contrast: "default",
  motion: "default"
};

const focusMainHeading = (): void => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLHeadingElement>("#main-content h1")
        ?.focus({ preventScroll: true });
    });
  });
};

const loadPreferences = (): DisplayPreferences => {
  try {
    const value = JSON.parse(localStorage.getItem("accessloom-display") ?? "");
    return { ...defaultPreferences, ...value };
  } catch {
    return defaultPreferences;
  }
};

function App() {
  const workspace = useLiveQuery(
    async () => (await db.workspace.get("workspace")) ?? null,
    []
  );
  const adjustments =
    useLiveQuery(() => db.adjustments.orderBy("updatedAt").reverse().toArray(), []) ?? [];
  const checkIns =
    useLiveQuery(() => db.checkIns.orderBy("recordedAt").reverse().toArray(), []) ?? [];
  const commitments =
    useLiveQuery(() => db.commitments.orderBy("createdAt").reverse().toArray(), []) ?? [];
  const [activeView, setActiveView] = useState<ViewId>(viewFromHash);
  const [preferences, setPreferences] = useState<DisplayPreferences>(loadPreferences);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [adjustmentInitial, setAdjustmentInitial] = useState<Partial<Adjustment> | null>(null);
  const [commitmentOpen, setCommitmentOpen] = useState(false);
  const [commitmentAdjustmentId, setCommitmentAdjustmentId] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setActiveView(viewFromHash());
      focusMainHeading();
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.textScale = preferences.textScale;
    document.documentElement.dataset.contrast = preferences.contrast;
    document.documentElement.dataset.motion = preferences.motion;
  }, [preferences]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const navigate = (view: ViewId) => {
    window.location.hash = `/${view}`;
    setActiveView(view);
    const reduceMotion =
      preferences.motion === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    focusMainHeading();
  };

  const addSupport = (initial?: Partial<Adjustment>) => {
    setAdjustmentInitial(initial ?? null);
    setAdjustmentOpen(true);
  };

  const editSupport = (adjustment: Adjustment) => {
    setAdjustmentInitial(adjustment);
    setAdjustmentOpen(true);
  };

  const addCommitment = (adjustmentId = "") => {
    setCommitmentAdjustmentId(adjustmentId);
    setCommitmentOpen(true);
  };

  if (workspace === undefined) {
    return (
      <main id="main-content" className="loading-screen" aria-live="polite">
        <span className="loading-loom" aria-hidden="true" />
        <p>Opening your private workspace…</p>
      </main>
    );
  }

  if (!workspace) {
    return (
      <>
        <Welcome
          onStartDemo={initializeDemoWorkspace}
          onStartFresh={initializeFreshWorkspace}
        />
        <PwaUpdateToast />
      </>
    );
  }

  return (
    <>
      <AppShell
        workspace={workspace}
        activeView={activeView}
        onNavigate={navigate}
        onCheckIn={() => setCheckInOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      >
        {activeView === "today" && (
          <TodayView
            workspace={workspace}
            adjustments={adjustments}
            checkIns={checkIns}
            commitments={commitments}
            onCheckIn={() => setCheckInOpen(true)}
            onAddCommitment={() => addCommitment()}
            onEditSupport={editSupport}
            onNavigate={navigate}
            onToast={setToast}
          />
        )}
        {activeView === "patterns" && (
          <PatternsView
            adjustments={adjustments}
            checkIns={checkIns}
            onCheckIn={() => setCheckInOpen(true)}
          />
        )}
        {activeView === "supports" && (
          <SupportsView
            adjustments={adjustments}
            checkIns={checkIns}
            commitments={commitments}
            onAdd={addSupport}
            onEdit={editSupport}
            onAddCommitment={addCommitment}
            onToast={setToast}
          />
        )}
        {activeView === "passport" && (
          <PassportView
            workspace={workspace}
            adjustments={adjustments}
            checkIns={checkIns}
            onToast={setToast}
          />
        )}
      </AppShell>
      <CheckInDialog
        open={checkInOpen}
        adjustments={adjustments}
        onClose={() => setCheckInOpen(false)}
        onSaved={() => setToast("Check-in saved only on this device.")}
      />
      <AdjustmentDialog
        open={adjustmentOpen}
        initial={adjustmentInitial}
        onClose={() => setAdjustmentOpen(false)}
        onSaved={() => setToast("Support saved to your private lab.")}
      />
      <CommitmentDialog
        open={commitmentOpen}
        adjustments={adjustments}
        initialAdjustmentId={commitmentAdjustmentId}
        onClose={() => setCommitmentOpen(false)}
        onSaved={() => setToast("Follow-through captured.")}
      />
      <SettingsPanel
        open={settingsOpen}
        workspace={workspace}
        preferences={preferences}
        onPreferences={setPreferences}
        onClose={() => setSettingsOpen(false)}
        onToast={setToast}
      />
      {toast && (
        <div className="app-toast" role="status">
          <Check size={17} aria-hidden="true" /> {toast}
        </div>
      )}
      <PwaUpdateToast />
    </>
  );
}

export default App;
