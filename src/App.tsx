
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NeighborProvider } from "@/context/NeighborContext";
import { PackageProvider } from "@/context/PackageContext";
import Index from "./pages/Index";
import Packages from "./pages/Packages";
import BulkPackageRegistration from "./pages/BulkPackageRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NeighborProvider>
        <PackageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/bulk-packages" element={<BulkPackageRegistration />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PackageProvider>
      </NeighborProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
