import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter } from 'lucide-react';

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-1 text-sm text-[#C0C0C0]">
            <span>© {currentYear} SubscriptionMaster.</span>
            <span className="hidden md:inline">Made with</span>
            <Heart className="h-4 w-4 text-red-400" />
            <span className="hidden md:inline">by the team.</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/terms" className="text-sm text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">
              Privacy
            </Link>
            <Link to="/help" className="text-sm text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">
              Help Center
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#C0C0C0] hover:text-[#00A6B2] transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#C0C0C0] hover:text-[#00A6B2] transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}