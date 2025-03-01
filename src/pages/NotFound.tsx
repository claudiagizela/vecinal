
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center animate-slide-up">
      <div className="rounded-full bg-secondary p-6 mb-6">
        <FileQuestion size={48} className="text-primary" />
      </div>
      <h1 className="text-6xl font-bold tracking-tighter mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-sm">
        Esta página no existe o ha sido movida a otra ubicación.
      </p>
      <Button asChild size="lg" className="group">
        <a href="/" className="transition-all duration-200">
          Regresar al Inicio
        </a>
      </Button>
    </div>
  );
};

export default NotFound;
