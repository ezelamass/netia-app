import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Splash inline de index.html: se va con un fade de 150 ms apenas pinta React.
requestAnimationFrame(() => requestAnimationFrame(() => {
  const splash = document.getElementById("splash");
  if (!splash) return;
  splash.style.opacity = "0";
  window.setTimeout(() => splash.remove(), 150);
}));

// PWA: el service worker solo se registra en producción (en dev rompería el HMR).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
