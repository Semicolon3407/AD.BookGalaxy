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
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center"
            >
              <div className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  BookGalaxy
                </span>
                <span className="text-xs text-gray-500">Your Literary Universe</span>
              </div>
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search for books, authors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 py-2 bg-indigo-600 text-white rounded-r-xl hover:bg-indigo-700 focus:outline-none"
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
                  className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium"
                >
                  <Book className="w-4 h-4 mr-1.5" />
                  Books
                </Link>
                <Link 
                  to="/announcements" 
                  className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium"
                >
                  <Bell className="w-4 h-4 mr-1.5" />
                  Announcements
                </Link>
                {user?.role === 'Member' && (
                  <Link 
                    to="/orders" 
                    className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors text-sm font-medium"
                  >
                    <Package className="w-4 h-4 mr-1.5" />
                    Orders
                  </Link>
                )}
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
                        className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative"
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
                        className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative"
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
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 pr-3 transition-colors"
                    >
                      <div className="bg-indigo-600 rounded-full p-1">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 mr-1.5">{user.fullName?.split(' ')[0] || 'User'}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                          Profile
                        </Link>
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
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 px-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 py-2 bg-indigo-600 text-white rounded-r-xl hover:bg-indigo-700 focus:outline-none"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link 
                to="/books" 
                className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Book className="w-5 h-5 mr-3" />
                  <span>Browse Books</span>
                </div>
              </Link>
              <Link 
                to="/announcements" 
                className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
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
                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Package className="w-5 h-5 mr-3" />
                      <span>Orders</span>
                    </div>
                  </Link>
                  <Link 
                    to="/cart" 
                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
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
                    className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
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
                  className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    to="/login"
                    className="w-full py-2.5 text-center bg-white border border-indigo-600 text-indigo-600 font-medium rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 text-center bg-indigo-600 text-white font-medium rounded-lg"
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