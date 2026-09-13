import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Global styles must load before App: App imports the lesson pages, and each
// lesson stylesheet overrides these shared rules with equal specificity.
import "../styles.css";
import "./react.css";
import App from "./App";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
