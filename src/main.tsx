import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/welcome.css";
import "./styles/components.css";
import "./styles/settings.css";
import "./styles/today.css";
import "./styles/patterns.css";
import "./styles/supports.css";
import "./styles/passport.css";
import "./styles/print.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
