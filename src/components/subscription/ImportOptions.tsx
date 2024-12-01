import React from 'react';
import { Mail, Upload } from 'lucide-react';

const importMethods = [
  {
    icon: Mail,
    title: 'Email Import',
    description: 'Connect your email to automatically detect subscription emails',
    action: 'Connect Email'
  },
  {
    icon: Upload,
    title: 'Upload Statement',
    description: 'Upload a bank statement or CSV file to import subscriptions',
    action: 'Upload File'
  }
];

export function ImportOptions() {
  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
      <h2 className="text-lg font-semibold text-[#EAEAEA] mb-6">Import Subscriptions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {importMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <div
              key={index}
              className="p-6 border border-[#2A2A2A] rounded-lg hover:border-[#00A6B2] transition-colors group cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-[#2A2A2A] group-hover:bg-[#00A6B2]/10 mb-4">
                  <Icon className="h-6 w-6 text-[#00A6B2]" />
                </div>
                <h3 className="text-[#EAEAEA] font-medium mb-2">{method.title}</h3>
                <p className="text-sm text-[#C0C0C0] mb-4">{method.description}</p>
                <button className="text-[#00A6B2] hover:text-[#008A94] text-sm font-medium">
                  {method.action}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}