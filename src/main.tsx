import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SafeErrorBoundary } from 
  '@/components/common/SafeErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SafeErrorBoundary source="App">
      <App />
    </SafeErrorBoundary>
  </React.StrictMode>
);
