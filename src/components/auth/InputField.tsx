import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  register: UseFormRegister<any>;
  error?: string;
  placeholder?: string;
}

export function InputField({ 
  label, 
  name, 
  type, 
  register, 
  error, 
  placeholder 
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[#EAEAEA]">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className="appearance-none block w-full px-3 py-2 border border-[#2A2A2A] rounded-md shadow-sm bg-[#121212] text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:ring-[#00A6B2] focus:border-[#00A6B2]"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}