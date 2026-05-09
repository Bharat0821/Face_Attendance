import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, Menu, X } from 'lucide-react';

const Navbar = ({ teacher, setTeacher }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('teacher');
    setTeacher(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Student Dashboard', path: '/student-dashboard' },
    { name: 'Attendance', path: '/attendance' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center">
            {/* Logo links to dashboard if logged in, otherwise login */}
            <Link to={teacher ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-slate-800">FaceAttend</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Show links for all users (logged in or not) */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

            {teacher ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 italic">
                  Hello, {teacher.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-100"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                <LogIn size={16} />
                Teacher Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-slate-500">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2">
          {/* Show links for all users */}
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl ${isActive(link.path) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
            >
              {link.name}
            </Link>
          ))}

          {teacher ? (
            <button 
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }} 
              className="w-full mt-4 bg-rose-600 text-white py-3 rounded-xl font-bold"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)} 
              className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-bold"
            >
              Teacher Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;