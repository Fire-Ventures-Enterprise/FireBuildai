import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MapPin, 
  Receipt, 
  BarChart3, 
  MessageCircle, 
  Truck,
  Settings,
  Building2
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "GPS Tracking", href: "/tracking", icon: MapPin },
  { name: "Contractors", href: "/contractors", icon: Users },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Client Portal", href: "/clients", icon: MessageCircle },
  { name: "Fleet", href: "/fleet", icon: Truck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold fire-logo">
            FireBuild.ai
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          © 2024 FireBuild.ai
        </p>
      </div>
    </>
  );
}