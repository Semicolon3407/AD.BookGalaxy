import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  UserCircle2, 
  ShoppingBag, 
  MessageCircle, 
  Bell, 
  BookOpen, 
  CheckSquare,
  LogOut,
  User,
  Home,
  Settings,
  Library
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Fixed width sidebar (no collapsing)
  const isCollapsed = false; // Hard-coded to false since we're removing the toggle functionality
  
  // Hide sidebar if not logged in or not staff/admin
  if (!user || (user.role !== 'Admin' && user.role !== 'Staff')) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavItems = () => {
    if (user?.role === 'Admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
        { path: '/admin/users', label: 'User Management', icon: <UserCircle2 className="w-5 h-5" /> },
        { path: '/admin/orders', label: 'Order Management', icon: <ShoppingBag className="w-5 h-5" /> },
        { path: '/admin/reviews', label: 'Review Management', icon: <MessageCircle className="w-5 h-5" /> },
        { path: '/admin/books', label: 'Book Management', icon: <Library className="w-5 h-5" /> },
        { path: '/admin/announcements', label: 'Announcement Management', icon: <Bell className="w-5 h-5" /> },
      ];
    } else if (user?.role === 'Staff') {
      return [
        { path: '/staff', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
        { path: '/staff/books', label: 'Book Management', icon: <Library className="w-5 h-5" /> },
        { path: '/staff/fulfilled-orders', label: 'Order History', icon: <CheckSquare className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen w-72 bg-indigo-900 text-white z-40 flex flex-col transition-all duration-300"
      >
        {/* Brand/Logo Section */}
        <div className="p-6">
          <h1 className="font-bold text-2xl">Book Galaxy</h1>
        </div>

        {/* User Profile Section */}
        <div className="px-6 py-4 border-b border-indigo-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{user?.username}</h2>
              <p className="text-sm text-indigo-300 truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-3">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-indigo-700 text-white font-semibold'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Settings Button */}
        <div className="px-4 pt-3">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-indigo-200 hover:bg-indigo-800 hover:text-white"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-indigo-700 text-white hover:bg-indigo-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;