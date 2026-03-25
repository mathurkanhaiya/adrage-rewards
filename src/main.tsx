import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Expand Telegram WebApp to full height
const tg = (window as any).Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f1117');
  tg.setBackgroundColor('#0f1117');
}

createRoot(document.getElementById("root")!).render(<App />);
