import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import UploadPage from "./pages/Upload";
import Results from "./pages/Results";
import ActionPlan from "./pages/ActionPlan";
import CareerExplorer from "./pages/CareerExplorer";
import NotFound from "./pages/NotFound";

import { SafeErrorBoundary } from "@/components/common/SafeErrorBoundary";
import { DebugObservabilityPanel } from "@/components/debug/DebugObservabilityPanel";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeErrorBoundary source="AppRoot">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/results" element={
                <SafeErrorBoundary source="ResultsRoute">
                  <Results />
                </SafeErrorBoundary>
              } />
              <Route path="/action-plan" element={
                <SafeErrorBoundary source="ActionPlanRoute">
                  <ActionPlan />
                </SafeErrorBoundary>
              } />
              <Route path="/career-explorer" element={
                <SafeErrorBoundary source="CareerExplorerRoute">
                  <CareerExplorer />
                </SafeErrorBoundary>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          {import.meta.env.DEV && (
            <DebugObservabilityPanel />
          )}
        </TooltipProvider>
      </SafeErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
