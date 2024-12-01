import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackToHome() {
  return (
    <Link 
      to="/" 
      className="inline-flex items-center justify-center gap-2 text-[#C0C0C0] hover:text-[#00A6B2] transition-colors mt-6 w-full"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back to Home</span>
    </Link>
  );
}