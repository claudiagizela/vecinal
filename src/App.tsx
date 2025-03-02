import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NeighborProvider } from "@/context/NeighborContext";
import { PackageProvider } from "@/context/PackageContext";
import { AuthProvider } from "@/context/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Neighbors from "./pages/Neighbors";
import Packages from "./pages/Packages";
import BulkPackageRegistration from "./pages/BulkPackageRegistration";
import Users from "./pages/Users";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <NeighborProvider>
            <PackageProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Navigate to="/packages" replace />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/packages" 
                  element={
                    <ProtectedRoute>
                      <Packages />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/neighbors" 
                  element={
                    <ProtectedRoute>
                      <Neighbors />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bulk-packages" 
                  element={
                    <ProtectedRoute>
                      <BulkPackageRegistration />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PackageProvider>
          </NeighborProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
