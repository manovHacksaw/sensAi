import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-12 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="animate-fade-in">
            <h3 className="font-semibold mb-4 text-lg tracking-wide">SensAI</h3>
            <p className="text-sm opacity-70">Your AI-powered career partner</p>
          </div>
          <div className="animate-fade-in delay-100">
            <h3 className="font-semibold mb-4 text-lg tracking-wide">Company</h3>
            <ul className="space-y-2">
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">About</li>
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">Blog</li>
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">Careers</li>
            </ul>
          </div>
          <div className="animate-fade-in delay-200">
            <h3 className="font-semibold mb-4 text-lg tracking-wide">Resources</h3>
            <ul className="space-y-2">
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">Documentation</li>
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">Support</li>
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">Privacy Policy</li>
            </ul>
          </div>
          <div className="animate-fade-in delay-300">
            <h3 className="font-semibold mb-4 text-lg tracking-wide">Connect</h3>
            <ul className="space-y-2">
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">Twitter</li>
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">LinkedIn</li>
              <li className="cursor-pointer transition-all duration-200 hover:translate-x-1">Contact</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm opacity-70">
          © 2025 SensAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};