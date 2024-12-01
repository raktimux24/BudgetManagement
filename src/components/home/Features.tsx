import React from 'react';
import { LineChart, Bell, Shield, Wallet, Zap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: <LineChart className="h-6 w-6 text-[#00A6B2]" />,
    title: "Spending Analytics",
    description: "Visualize your subscription spending patterns with detailed analytics and insights."
  },
  {
    icon: <Bell className="h-6 w-6 text-[#C5A900]" />,
    title: "Smart Reminders",
    description: "Never miss a payment or free trial end with intelligent notifications."
  },
  {
    icon: <Shield className="h-6 w-6 text-[#6A4C93]" />,
    title: "Secure Management",
    description: "Bank-level encryption keeps your subscription data safe and protected."
  },
  {
    icon: <Wallet className="h-6 w-6 text-[#00A6B2]" />,
    title: "Budget Tracking",
    description: "Set spending limits and get alerts when you're approaching your budget."
  },
  {
    icon: <Zap className="h-6 w-6 text-[#C5A900]" />,
    title: "Quick Actions",
    description: "Cancel or modify subscriptions with one click through our platform."
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-[#6A4C93]" />,
    title: "Cost Optimization",
    description: "Get personalized recommendations to reduce unnecessary expenses."
  }
];

export function Features() {
  return (
    <section id="features" className="bg-[#121212] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#EAEAEA] mb-4">
            Powerful Features for Complete Control
          </h2>
          <p className="text-[#C0C0C0] max-w-2xl mx-auto">
            Everything you need to manage your subscriptions effectively in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1A] p-6 rounded-xl hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-[#2A2A2A] rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#C0C0C0]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}