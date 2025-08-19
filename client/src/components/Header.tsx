import { Flame, Bell, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-fire-dark/90 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer" data-testid="header-logo">
              <div className="w-10 h-10 fire-gradient rounded-xl flex items-center justify-center">
                <Flame className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold fire-logo">
                  FireBuild.ai
                </h1>
                <p className="text-sm text-gray-400">Contractor Management Platform</p>
              </div>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" data-testid="header-nav">
            <Link href="/">
              <span className={`${isActive('/') ? 'text-fire-blue font-medium' : 'text-gray-300 hover:text-white'} transition-colors cursor-pointer`}>
                Dashboard
              </span>
            </Link>
            <Link href="/documents">
              <span className={`${isActive('/documents') ? 'text-fire-blue font-medium' : 'text-gray-300 hover:text-white'} transition-colors cursor-pointer`}>
                Documents
              </span>
            </Link>
            <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Jobs</span>
            <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Contractors</span>
            <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Payments</span>
            <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Analytics</span>
          </nav>
          
          <div className="flex items-center space-x-4" data-testid="header-user-section">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium" data-testid="text-company-name">ABC Contracting</p>
                <p className="text-xs text-gray-400" data-testid="text-company-plan">Pro Plan • 5 Active Jobs</p>
              </div>
              <div className="w-10 h-10 bg-fire-blue rounded-full flex items-center justify-center" data-testid="avatar-user">
                <User className="text-white w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
