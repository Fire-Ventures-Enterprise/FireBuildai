import logoLight from "@assets/1_1755652872023.jpg";
import logoDark from "@assets/3_1755652955031.jpg";

export default function Footer() {
  return (
    <footer className="border-t border-gray-700 mt-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4" data-testid="footer-brand">
            <img 
              src={logoLight}
              alt="FireBuild.ai" 
              className="h-8 w-auto dark:hidden"
              data-testid="footer-logo-light"
            />
            <img 
              src={logoDark}
              alt="FireBuild.ai" 
              className="h-8 w-auto hidden dark:block"
              data-testid="footer-logo-dark"
            />
            <div>
              <p className="text-xs text-gray-400">© 2024 All rights reserved</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400" data-testid="footer-links">
            <a href="#" className="hover:text-white transition-colors" data-testid="link-support">Support</a>
            <a href="#" className="hover:text-white transition-colors" data-testid="link-privacy">Privacy</a>
            <a href="#" className="hover:text-white transition-colors" data-testid="link-terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
