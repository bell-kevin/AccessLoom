import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export function PwaUpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const refreshing = useRef(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const listen = (value: ServiceWorkerRegistration) => {
      registration.current = value;
      if (value.waiting) setNeedRefresh(true);
      value.addEventListener("updatefound", () => {
        const worker = value.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setNeedRefresh(true);
          }
        });
      });
    };
    void navigator.serviceWorker.register("/sw.js").then(listen);
    const controllerChange = () => {
      if (refreshing.current) return;
      refreshing.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChange);
    return () =>
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChange);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="update-toast" role="status">
      <div>
        <strong>A fresh version is ready.</strong>
        <span>Updating reloads the page. Finish or save any open form first.</span>
      </div>
      <button
        className="button button--small button--primary"
        type="button"
        onClick={() => {
          const confirmed = window.confirm(
            "Reload and update AccessLoom now? Any unsaved edits in an open form will be lost."
          );
          if (confirmed) {
            registration.current?.waiting?.postMessage({ type: "SKIP_WAITING" });
          }
        }}
      >
        <RefreshCw size={15} /> Reload & update
      </button>
      <button className="icon-button" type="button" onClick={() => setNeedRefresh(false)} aria-label="Dismiss update">
        <X size={17} />
      </button>
    </div>
  );
}
