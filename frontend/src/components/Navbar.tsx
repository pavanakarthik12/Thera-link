import { Link, useLocation } from "react-router-dom";
import { Pill, Home, Stethoscope, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">TheraLink</span>
              <p className="text-xs text-muted-foreground hidden sm:block">Treatment Adherence</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button
                variant={isActive("/") && location.pathname === "/" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
            
            <Link to="/doctor">
              <Button
                variant={isActive("/doctor") ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Stethoscope className="h-4 w-4" />
                <span>Doctor</span>
              </Button>
            </Link>

            <Link to="/patient/demo">
              <Button
                variant={isActive("/patient") ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span>Patient</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive("/") && location.pathname === "/" ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                
                <Link to="/doctor" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive("/doctor") ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Doctor
                  </Button>
                </Link>

                <Link to="/patient/demo" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive("/patient") ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <User className="h-4 w-4" />
                    Patient
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
