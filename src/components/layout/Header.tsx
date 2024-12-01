import React from 'react';
import { Menu, X, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="fixed w-full bg-[#121212]/95 backdrop-blur-sm z-50 border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <CreditCard className="h-8 w-8 text-[#00A6B2]" />
            <span className="ml-2 text-xl font-bold text-[#EAEAEA]">SubscriptionMaster</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">Features</a>
            <a href="#pricing" className="text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">Pricing</a>
            <a href="#testimonials" className="text-[#C0C0C0] hover:text-[#00A6B2] transition-colors">Testimonials</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-[#EAEAEA] hover:text-[#00A6B2] transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="bg-[#00A6B2] text-white px-4 py-2 rounded-lg hover:bg-[#008A94] transition-colors"
            >
              Sign up
            </Link>
          </div>

          <button 
            className="md:hidden text-[#EAEAEA]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#121212] border-t border-[#2A2A2A]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#features" className="block px-3 py-2 text-[#C0C0C0] hover:text-[#00A6B2]">Features</a>
            <a href="#pricing" className="block px-3 py-2 text-[#C0C0C0] hover:text-[#00A6B2]">Pricing</a>
            <a href="#testimonials" className="block px-3 py-2 text-[#C0C0C0] hover:text-[#00A6B2]">Testimonials</a>
            <div className="px-3 py-2 space-y-2">
              <Link 
                to="/login" 
                className="block w-full text-[#EAEAEA] hover:text-[#00A6B2] py-2"
              >
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="block w-full bg-[#00A6B2] text-white px-4 py-2 rounded-lg hover:bg-[#008A94] text-center"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}