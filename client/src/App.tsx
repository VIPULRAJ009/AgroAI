import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Register from "../src/pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import FindTransport from "./pages/FindTransport";
import Weather from "./pages/Weather";
import CropRecommender from "./pages/CropRecommender";
import FertilizerPrediction from "./pages/FertilizerPrediction";
import Results from "./pages/Results";
import SoilReports from "./pages/SoilReports";
import Feedback from "./pages/Feedback";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Transport from "./pages/Transport";
import TransporterDashboard from "./pages/TransporterDashboard";

import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import FallingLeafLoader from "./components/FallingLeafLoader";
import { useState } from "react";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/passwordreset/:resetToken" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/crop-recommender" element={<CropRecommender />} />
          <Route path="/fertilizer-prediction" element={<FertilizerPrediction />} />
          <Route path="/results" element={<Results />} />
          <Route path="/soil-reports" element={<SoilReports />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/transporter-dashboard" element={<TransporterDashboard />} />
          <Route path="/find-transport" element={<FindTransport />} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      {showSplash && <FallingLeafLoader onComplete={() => setShowSplash(false)} />}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
