import React from 'react';
import { NavLink } from 'react-router-dom';
import { Database, FileText } from 'lucide-react';
import Logo from './Logo';

const Sidebar = () => {
  const menuItems = [
    { icon: Database, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Factures', path: '/factures' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen px-4 py-6">
      <div className="mb-8 px-2">
        <Logo />
      </div>
      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;