import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import HomePage from "./pages/HomePage";
import MinePage from "./pages/MinePage";
import EarnPage from "./pages/EarnPage";
import TasksPage from "./pages/TasksPage";
import RankingPage from "./pages/RankingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" theme="dark" />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mine" element={<MinePage />} />
            <Route path="/earn" element={<EarnPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
