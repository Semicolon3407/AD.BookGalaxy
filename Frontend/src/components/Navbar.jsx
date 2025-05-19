import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBookmark } from '../context/BookmarkContext';
import { 
  ShoppingCart, 
  Bookmark, 
  Search, 
  User, 
  LogOut, 
  Book, 
  Menu, 
  X, 
  Bell, 
  Package,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { bookmarkCount } = useBookmark();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Only render for members and unauthenticated users
  if (user && (user.role === 'Admin' || user.role === 'Staff')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white fixed top-0 left-0 right-0 z-50 border-b border-indigo-400/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center"
            >
              <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-teal-500 text-white p-2 rounded-lg mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6M5 3l14 9-14 9" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  BookGalaxy
                </span>
               
              </div>
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-indigo-200" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/10 backdrop-blur-sm border border-indigo-400/30 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
                  placeholder="Search for books, authors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 py-2 bg-white text-indigo-600 rounded-r-xl hover:bg-indigo-50 focus:outline-none"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right side - Nav Links and Auth */}
          <div className="flex items-center">
            {/* Desktop Navigation Links */}
            {(!user || user.role === 'Member') && (
              <div className="hidden lg:flex items-center space-x-6 mr-4">
                <Link 
                  to="/books" 
                  className="flex items-center text-white hover:text-indigo-100 transition-colors text-sm font-medium"
                >
                  <Book className="w-4 h-4 mr-1.5" />
                  Books
                </Link>
                <Link 
                  to="/announcements" 
                  className="flex items-center text-white hover:text-indigo-100 transition-colors text-sm font-medium"
                >
                  <Bell className="w-4 h-4 mr-1.5" />
                  Announcements
                </Link>
              </div>
            )}

            {/* Auth and action buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Icons for member */}
                  {user.role === 'Member' && (
                    <div className="flex items-center space-x-2">
                      <Link 
                        to="/cart" 
                        className="p-2 text-white hover:text-indigo-100 hover:bg-indigo-500/30 rounded-full transition-colors relative"
                        title="Shopping Cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                      <Link 
                        to="/bookmarks" 
                        className="p-2 text-white hover:text-indigo-100 hover:bg-indigo-500/30 rounded-full transition-colors relative"
                        title="Bookmarks"
                      >
                        <Bookmark className="w-5 h-5" />
                        {bookmarkCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {bookmarkCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  )}

                  {/* Profile dropdown */}
                  <div className="relative ml-2">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 bg-indigo-500/30 hover:bg-indigo-500/50 rounded-full p-1.5 pr-3 transition-colors"
                    >
                      <div className="bg-indigo-600 rounded-full p-1">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white mr-1.5">{user.fullName?.split(' ')[0] || 'User'}</span>
                      <ChevronDown className="w-4 h-4 text-white" />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                          Orders
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 text-sm font-medium rounded-md shadow-sm transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-indigo-100 hover:bg-indigo-500/30 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-indigo-400/30 py-3 px-2 bg-indigo-700/50">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-indigo-200" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/10 backdrop-blur-sm border border-indigo-400/30 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 py-2 bg-white text-indigo-600 rounded-r-xl hover:bg-indigo-50 focus:outline-none"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link 
                to="/books" 
                className="flex items-center justify-between p-3 rounded-lg text-white hover:bg-indigo-500/30 hover:text-indigo-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Book className="w-5 h-5 mr-3" />
                  <span>Browse Books</span>
                </div>
              </Link>
              <Link 
                to="/announcements" 
                className="flex items-center justify-between p-3 rounded-lg text-white hover:bg-indigo-500/30 hover:text-indigo-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-3" />
                  <span>Announcements</span>
                </div>
              </Link>
              {user?.role === 'Member' && (
                <>
                  <Link 
                    to="/orders" 
                    className="flex items-center justify-between p-3 rounded-lg text-white hover:bg-indigo-500/30 hover:text-indigo-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Package className="w-5 h-5 mr-3" />
                      <span>Orders</span>
                    </div>
                  </Link>
                  <Link 
                    to="/cart" 
                    className="flex items-center justify-between p-3 rounded-lg text-white hover:bg-indigo-500/30 hover:text-indigo-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      <span>Cart</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/bookmarks" 
                    className="flex items-center justify-between p-3 rounded-lg text-white hover:bg-indigo-500/30 hover:text-indigo-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Bookmark className="w-5 h-5 mr-3" />
                      <span>Bookmarks</span>
                    </div>
                    {bookmarkCount > 0 && (
                      <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {bookmarkCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/30"
                >
                  <LogOut Marriage="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    to="/login"
                    className="w-full py-2.5 text-center bg-white hover:bg-indigo-50 text-indigo-600 font-medium rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;