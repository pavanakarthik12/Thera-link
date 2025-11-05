import { Home, UserPlus, Pill, BarChart3, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: Home, path: "/doctor" },
  { title: "Patients", icon: Users, path: "/doctor" },
  { title: "Add Patient", icon: UserPlus, path: "/doctor" },
  { title: "Prescriptions", icon: Pill, path: "/doctor" },
  { title: "Reports", icon: BarChart3, path: "/doctor/reports" },
];

export const DoctorSidebar = () => {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Pill className="h-7 w-7" />
          TheraLink
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Doctor Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/doctor"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-secondary/80",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">DR</span>
          </div>
          <div>
            <p className="text-sm font-medium">Doctor</p>
            <p className="text-xs text-muted-foreground">Healthcare Provider</p>
          </div>
        </div>
      </div>
    </aside>
  );
};