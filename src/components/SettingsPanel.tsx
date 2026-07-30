import { useRef, useState } from "react";
import {
  Accessibility,
  Check,
  Database,
  Download,
  ExternalLink,
  FileKey,
  Github,
  HardDrive,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload
} from "lucide-react";
import {
  clearWorkspace,
  initializeDemoWorkspace,
  initializeFreshWorkspace
} from "../db";
import {
  downloadBackup,
  downloadEncryptedBackup,
  importBackup
} from "../lib/portable";
import type { DisplayPreferences, WorkspaceRecord } from "../types";
import { Dialog } from "./ui/Dialog";

interface SettingsPanelProps {
  open: boolean;
  workspace: WorkspaceRecord;
  preferences: DisplayPreferences;
  onPreferences: (preferences: DisplayPreferences) => void;
  onClose: () => void;
  onToast: (message: string) => void;
}

export function SettingsPanel({
  open,
  workspace,
  preferences,
  onPreferences,
  onClose,
  onToast
}: SettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [importPassphrase, setImportPassphrase] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const sourceUrl = import.meta.env.VITE_SOURCE_URL?.trim();

  const updatePreferences = (next: Partial<DisplayPreferences>) => {
    const value = { ...preferences, ...next };
    localStorage.setItem("accessloom-display", JSON.stringify(value));
    onPreferences(value);
  };

  const persistStorage = async () => {
    if (!navigator.storage?.persist) {
      setPersistent(false);
      return;
    }
    const granted = await navigator.storage.persist();
    setPersistent(granted);
  };

  const encryptedExport = async () => {
    setError("");
    if (passphrase !== confirmPassphrase) {
      setError("The two backup passphrases do not match.");
      return;
    }
    setBusy("encrypted");
    try {
      await downloadEncryptedBackup(passphrase);
      setPassphrase("");
      setConfirmPassphrase("");
      onToast("Encrypted backup downloaded. Keep the passphrase separately.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the backup.");
    } finally {
      setBusy("");
    }
  };

  const handleImport = async (file: File) => {
    const confirmed = window.confirm(
      `Restore “${file.name}”? This will replace every record in this browser workspace. Export a backup first if you may need the current data.`
    );
    if (!confirmed) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setError("");
    setBusy("import");
    try {
      await importBackup(file, importPassphrase);
      setImportPassphrase("");
      onToast("Workspace restored from backup.");
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "This backup could not be restored.");
    } finally {
      setBusy("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const startFresh = async () => {
    if (!window.confirm("Replace this workspace with a blank one? Export a backup first if you want to keep anything.")) return;
    await initializeFreshWorkspace();
    onToast("A fresh private workspace is ready.");
    onClose();
  };

  const loadDemo = async () => {
    if (!window.confirm("Replace this workspace with the fictional demo? Export a backup first if needed.")) return;
    await initializeDemoWorkspace();
    onToast("Fictional demo loaded.");
    onClose();
  };

  const clear = async () => {
    if (!window.confirm("Clear every AccessLoom record from this browser? This cannot be undone without a backup.")) return;
    await clearWorkspace();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Data, display, and about"
      description="AccessLoom has no account page because there is no account."
      wide
    >
      <div className="settings-layout">
        <section className="settings-section">
          <div className="settings-section__heading">
            <span><Database size={20} /></span>
            <div><p className="eyebrow">Data</p><h3>Your browser is the database</h3></div>
          </div>
          <div className="local-data-summary">
            <LockKeyhole size={22} />
            <p>
              <strong>Stored locally in IndexedDB.</strong>
              <span>Clearing site data, changing domains, or losing this browser profile can remove it. A backup is the portability layer.</span>
            </p>
          </div>

          <div className="settings-action">
            <div>
              <strong>Plain JSON backup</strong>
              <span>Contains every check-in and private note in readable, unencrypted form. Store it somewhere you trust.</span>
            </div>
            <button
              className="button button--outline button--small"
              type="button"
              onClick={() => void downloadBackup().then(() => onToast("Backup downloaded."))}
            >
              <Download size={15} /> Export
            </button>
          </div>

          <div className="encrypted-backup">
            <div>
              <FileKey size={19} />
              <span><strong>Passphrase-encrypted backup</strong><small>AES-256-GCM · PBKDF2-SHA-256 · entirely on-device</small></span>
            </div>
            <div className="inline-input-action">
              <label>
                <span className="sr-only">Backup passphrase</span>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(event) => setPassphrase(event.target.value)}
                  placeholder="10+ character passphrase"
                  autoComplete="new-password"
                />
              </label>
              <label>
                <span className="sr-only">Confirm backup passphrase</span>
                <input
                  type="password"
                  value={confirmPassphrase}
                  onChange={(event) => setConfirmPassphrase(event.target.value)}
                  placeholder="Confirm passphrase"
                  autoComplete="new-password"
                />
              </label>
              <button
                className="button button--dark button--small"
                type="button"
                disabled={
                  passphrase.length < 10 ||
                  passphrase !== confirmPassphrase ||
                  Boolean(busy)
                }
                onClick={() => void encryptedExport()}
              >
                <KeyRound size={15} /> {busy === "encrypted" ? "Encrypting…" : "Encrypt & export"}
              </button>
            </div>
            {confirmPassphrase && (
              <p aria-live="polite">
                {passphrase === confirmPassphrase
                  ? "Passphrases match."
                  : "Passphrases do not match yet."}
              </p>
            )}
            <p>There is no password reset. Keep the passphrase somewhere separate from the backup.</p>
          </div>

          <div className="restore-box">
            <div>
              <Upload size={19} />
              <span><strong>Restore a backup</strong><small>Plain or AccessLoom-encrypted JSON</small></span>
            </div>
            <div className="inline-input-action">
              <label>
                <span className="sr-only">Passphrase if the backup is encrypted</span>
                <input
                  type="password"
                  value={importPassphrase}
                  onChange={(event) => setImportPassphrase(event.target.value)}
                  placeholder="Passphrase, if encrypted"
                  autoComplete="current-password"
                />
              </label>
              <input
                ref={fileRef}
                className="sr-only"
                type="file"
                accept=".json,application/json"
                tabIndex={-1}
                aria-label="Choose an AccessLoom backup file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImport(file);
                }}
              />
              <button className="button button--outline button--small" type="button" disabled={Boolean(busy)} onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> {busy === "import" ? "Restoring…" : "Choose file"}
              </button>
            </div>
          </div>

          {error && <p className="settings-error" role="alert">{error}</p>}

          <div className="settings-action">
            <div>
              <strong>Ask the browser for durable storage</strong>
              <span>This lowers the chance of automatic eviction. It is still not a backup.</span>
            </div>
            <button className="button button--soft button--small" type="button" onClick={() => void persistStorage()}>
              <HardDrive size={15} />
              {persistent === true ? "Granted" : persistent === false ? "Not available" : "Request"}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section__heading">
            <span><Accessibility size={20} /></span>
            <div><p className="eyebrow">Display</p><h3>Make the interface fit too</h3></div>
          </div>
          <div className="preference-list">
            <label>
              <span><strong>Larger interface text</strong><small>Increases the base scale without browser zoom.</small></span>
              <input
                type="checkbox"
                role="switch"
                checked={preferences.textScale === "large"}
                onChange={(event) => updatePreferences({ textScale: event.target.checked ? "large" : "default" })}
              />
            </label>
            <label>
              <span><strong>High contrast</strong><small>Uses stronger borders and darker secondary text.</small></span>
              <input
                type="checkbox"
                role="switch"
                checked={preferences.contrast === "high"}
                onChange={(event) => updatePreferences({ contrast: event.target.checked ? "high" : "default" })}
              />
            </label>
            <label>
              <span><strong>Reduce motion</strong><small>Stops decorative and smooth transition effects.</small></span>
              <input
                type="checkbox"
                role="switch"
                checked={preferences.motion === "reduced"}
                onChange={(event) => updatePreferences({ motion: event.target.checked ? "reduced" : "default" })}
              />
            </label>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section__heading">
            <span><ShieldCheck size={20} /></span>
            <div><p className="eyebrow">About</p><h3>FLOSS from edge to edge</h3></div>
          </div>
          <p className="settings-copy">
            AccessLoom is a static React PWA. It uses no backend, proprietary API,
            analytics SDK, remote font, ad network, or account service.
          </p>
          <div className="about-links">
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                <Github size={17} /> Source code <ExternalLink size={13} />
              </a>
            ) : (
              <span className="source-link-missing">
                <Github size={17} /> Source URL not configured by this deployer
              </span>
            )}
            <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noreferrer">
              <ShieldCheck size={17} /> AGPLv3 license <ExternalLink size={13} />
            </a>
            <a href="https://www.gov.uk/government/publications/health-adjustment-passport" target="_blank" rel="noreferrer">
              <Check size={17} /> Official UK passport guidance <ExternalLink size={13} />
            </a>
            <a href="https://www.eeoc.gov/laws/guidance/enforcement-guidance-reasonable-accommodation-and-undue-hardship-under-ada" target="_blank" rel="noreferrer">
              <Check size={17} /> U.S. EEOC guidance <ExternalLink size={13} />
            </a>
          </div>
          <p className="legal-note">
            AccessLoom is a communication and self-observation tool. It is not medical,
            employment, or legal advice and does not determine entitlement to an adjustment.
          </p>
        </section>

        <section className="settings-section settings-section--danger">
          <div className="settings-section__heading">
            <span><RefreshCw size={20} /></span>
            <div><p className="eyebrow">Workspace</p><h3>Reset or switch modes</h3></div>
          </div>
          <div className="reset-actions">
            {workspace.isDemo ? (
              <button className="button button--outline" type="button" onClick={() => void startFresh()}>
                Start a blank workspace
              </button>
            ) : (
              <button className="button button--outline" type="button" onClick={() => void loadDemo()}>
                Load the fictional demo
              </button>
            )}
            <button className="button button--danger" type="button" onClick={() => void clear()}>
              <Trash2 size={16} /> Clear this browser’s workspace
            </button>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
