import {
  Activity,
  BookOpenText,
  FlaskConical,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldCheck
} from "lucide-react";
import type { ReactNode } from "react";
import type { ViewId, WorkspaceRecord } from "../types";
import { Logo } from "./Logo";

const navigation: Array<{
  id: ViewId;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "today", label: "Today", shortLabel: "Today", icon: LayoutDashboard },
  { id: "patterns", label: "Patterns", shortLabel: "Patterns", icon: Activity },
  { id: "supports", label: "Support lab", shortLabel: "Supports", icon: FlaskConical },
  { id: "passport", label: "My passport", shortLabel: "Passport", icon: BookOpenText }
];

interface AppShellProps {
  workspace: WorkspaceRecord;
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  onCheckIn: () => void;
  onSettings: () => void;
  children: ReactNode;
}

export function AppShell({
  workspace,
  activeView,
  onNavigate,
  onCheckIn,
  onSettings,
  children
}: AppShellProps) {
  const name = workspace.profile.preferredName || "My workspace";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__top">
          <Logo inverse />
          <button
            className="sidebar__checkin"
            type="button"
            onClick={onCheckIn}
          >
            <Plus size={18} aria-hidden="true" />
            New check-in
          </button>
          <nav className="sidebar__nav" aria-label="Primary">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={activeView === item.id ? "is-active" : ""}
                  onClick={() => onNavigate(item.id)}
                  aria-current={activeView === item.id ? "page" : undefined}
                >
                  <Icon size={19} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="sidebar__bottom">
          <div className="privacy-stamp">
            <ShieldCheck size={19} aria-hidden="true" />
            <div>
              <strong>Private on this device</strong>
              <span>No automatic workspace upload</span>
            </div>
          </div>
          <button className="sidebar__settings" type="button" onClick={onSettings}>
            <span className="avatar" aria-hidden="true">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <strong>{name}</strong>
              <small>{workspace.isDemo ? "Fictional demo" : "Local workspace"}</small>
            </span>
            <Settings size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="mobile-header">
        <Logo />
        <div>
          {workspace.isDemo && <span className="pill pill--demo">Demo</span>}
          <button className="icon-button" type="button" onClick={onSettings} aria-label="Open data and display settings">
            <Settings size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <main id="main-content" className="app-main">
        {children}
      </main>

      <button className="mobile-checkin" type="button" onClick={onCheckIn}>
        <Plus size={22} aria-hidden="true" />
        <span className="sr-only">New check-in</span>
      </button>

      <nav className="bottom-nav" aria-label="Primary">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={activeView === item.id ? "is-active" : ""}
              onClick={() => onNavigate(item.id)}
              aria-current={activeView === item.id ? "page" : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
