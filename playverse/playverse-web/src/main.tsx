import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ConvexProvider } from "convex/react";
import { convex } from "./lib/convexClient.ts";
import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
