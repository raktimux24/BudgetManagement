import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#121212] pt-32 pb-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00A6B2]/10 via-transparent to-[#6A4C93]/10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-[#EAEAEA] mb-6">
            Master Your Subscriptions
            <span className="inline-block ml-2">
              <Sparkles className="h-8 w-8 text-[#C5A900]" />
            </span>
          </h1>
          
          <p className="text-xl text-[#C0C0C0] max-w-2xl mx-auto mb-8">
            Take control of your recurring payments. Track, manage, and optimize all your subscriptions in one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button className="bg-[#00A6B2] text-white px-8 py-3 rounded-lg hover:bg-[#008A94] transition-colors flex items-center justify-center">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border border-[#2A2A2A] text-[#EAEAEA] px-8 py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors">
              Watch Demo
            </button>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-[#00A6B2]">$2.5M+</div>
                <div className="text-[#C0C0C0]">Savings Found</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#00A6B2]">50K+</div>
                <div className="text-[#C0C0C0]">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#00A6B2]">99%</div>
                <div className="text-[#C0C0C0]">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}