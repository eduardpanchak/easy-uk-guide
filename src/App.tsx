import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import DocumentDetails from "./pages/DocumentDetails";
import NHS from "./pages/NHS";
import NHSDetails from "./pages/NHSDetails";
import Checklists from "./pages/Checklists";
import ChecklistDetails from "./pages/ChecklistDetails";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Housing from "./pages/Housing";
import HousingDetails from "./pages/HousingDetails";
import Benefits from "./pages/Benefits";
import BenefitDetails from "./pages/BenefitDetails";
import Education from "./pages/Education";
import EducationDetails from "./pages/EducationDetails";
import Saved from "./pages/Saved";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetails />} />
              <Route path="/nhs" element={<NHS />} />
              <Route path="/nhs/:id" element={<NHSDetails />} />
              <Route path="/checklists" element={<Checklists />} />
              <Route path="/checklists/:id" element={<ChecklistDetails />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/housing" element={<Housing />} />
              <Route path="/housing/:id" element={<HousingDetails />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route path="/benefits/:id" element={<BenefitDetails />} />
              <Route path="/education" element={<Education />} />
              <Route path="/education/:id" element={<EducationDetails />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/search" element={<Search />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
