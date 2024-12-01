import React from 'react';
import { CreditCard, Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-[#C0C0C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <CreditCard className="h-8 w-8 text-[#00A6B2]" />
              <span className="ml-2 text-xl font-bold text-[#EAEAEA]">SubscriptionMaster</span>
            </div>
            <p className="text-sm">
              Your all-in-one solution for subscription management and optimization.
            </p>
          </div>

          <div>
            <h3 className="text-[#EAEAEA] font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-[#00A6B2] transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-[#00A6B2] transition-colors">Pricing</a></li>
              <li><a href="#testimonials" className="hover:text-[#00A6B2] transition-colors">Testimonials</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#EAEAEA] font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#00A6B2] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#00A6B2] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#00A6B2] transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#EAEAEA] font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#00A6B2] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#00A6B2] transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-[#00A6B2] transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">
            © 2024 SubscriptionMaster. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-[#00A6B2] transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-[#00A6B2] transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-[#00A6B2] transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}