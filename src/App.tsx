import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ClerkAuthProvider } from "./context/ClerkAuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspacePage from "./pages/WorkspacePage";
import DesignPage from "./pages/DesignPage";
import ProfilePage from "./pages/ProfilePage";
import CodeEditorPage from "./pages/CodeEditorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClerkAuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/design" element={<DesignPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/editor" element={<CodeEditorPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ClerkAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
