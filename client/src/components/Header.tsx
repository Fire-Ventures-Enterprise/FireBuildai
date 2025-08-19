import { Flame, Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-fire-dark/90 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4" data-testid="header-logo">
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
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" data-testid="header-nav">
            <a href="#dashboard" className="text-fire-blue font-medium">Dashboard</a>
            <a href="#jobs" className="text-gray-300 hover:text-white transition-colors">Jobs</a>
            <a href="#contractors" className="text-gray-300 hover:text-white transition-colors">Contractors</a>
            <a href="#payments" className="text-gray-300 hover:text-white transition-colors">Payments</a>
            <a href="#analytics" className="text-gray-300 hover:text-white transition-colors">Analytics</a>
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
