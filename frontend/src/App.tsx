import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReportWaste from "./pages/ReportWaste";
import WaterTesting from "./pages/WaterTesting";
import LeaderboardPage from "./pages/LeaderboardPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import FloatingChatModel from "@/components/FloatingChatModel";
import TrackReports from "./pages/TrackReports";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={googleClientId}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
  <FloatingChatModel />

  
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/report-waste" element={<ReportWaste />} />
      <Route path="/water-testing" element={<WaterTesting />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/trackreports" element={<TrackReports />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
 
</BrowserRouter>

 </TooltipProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);


export default App;
