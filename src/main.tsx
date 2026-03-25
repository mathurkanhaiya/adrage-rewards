import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Expand Telegram WebApp to full height
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.setHeaderColor('#0f1117');
  window.Telegram.WebApp.setBackgroundColor('#0f1117');
}

createRoot(document.getElementById("root")!).render(<App />);
