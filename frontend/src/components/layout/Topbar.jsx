import React from 'react';
import { Menu, X } from 'lucide-react';

const Topbar = ({ onMenuToggle, sidebarOpen }) => {
  return (
    <div className="glass sticky top-0 z-40 border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AutoNova
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
