import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// अगर future में routing use करना हो तो HashRouter add कर सकते हैं
// अभी basic run के लिए simple रख रहे हैं

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
