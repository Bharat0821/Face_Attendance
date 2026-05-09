import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Registration', path: '/register', icon: <UserPlus size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <Camera size={20} /> },
    ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`relative flex flex-col bg-white border-r border-slate-200 h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-indigo-600 text-white rounded-full p-1 border-2 border-white"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded text-white">
          <Camera size={20} />
        </div>
        {!isCollapsed && <span className="font-bold text-lg">Admin Panel</span>}
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 text-gray-600 hover:text-red-600">
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;