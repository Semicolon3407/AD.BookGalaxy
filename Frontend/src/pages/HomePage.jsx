import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Snackbar, Alert } from '@mui/material';
import { 
  Book, 
  BookOpen, 
  User, 
  Beaker, 
  Clock, 
  Cpu, 
  ChevronRight, 
  ShoppingBag,
  Search,
  Star,
  BookMarked
} from 'lucide-react';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    fetchFeaturedBooks();
    
    // Show welcome message if user just logged in
    if (searchParams.get('from') === 'login' && user) {
      setOpenSnackbar(true);
    }
  }, [searchParams, user]);

  const fetchFeaturedBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/books');
      const featured = res.data.filter(book => book.isOnSale);
      setFeaturedBooks(featured);
    } catch (err) {
      setError('Failed to load featured books');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/books/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: 'Fiction', icon: <BookOpen className="w-6 h-6" /> },
    { name: 'Non-Fiction', icon: <Book className="w-6 h-6" /> },
    { name: 'Biography', icon: <User className="w-6 h-6" /> },
    { name: 'Science', icon: <Beaker className="w-6 h-6" /> },
    { name: 'History', icon: <Clock className="w-6 h-6" /> },
    { name: 'Technology', icon: <Cpu className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: '380px',
            background: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '6px',
            padding: '0'
          }
        }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: '#047857',
            '& .MuiAlert-icon': {
              marginRight: '12px',
              fontSize: '22px',
              opacity: 1,
              padding: '2px'
            },
            '& .MuiAlert-message': {
              padding: '4px 0',
              fontFamily: '"Inter", sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: 1.5
            },
            '& .MuiAlert-action': {
              padding: '0 8px',
              marginRight: '-8px'
            },
            '& .MuiIconButton-root': {
              color: '#ffffff',
              padding: '4px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            },
            '& .MuiSvgIcon-root': {
              fontSize: '20px'
            }
          }}
        >
          <div className="flex flex-col">
            <span className="font-medium">Welcome to BookGalaxy!</span>
            <span className="text-emerald-100 text-sm mt-0.5">
              {user?.role === 'Admin' ? 'Welcome to your admin dashboard' :
               user?.role === 'Staff' ? 'Welcome to your staff dashboard' :
               'Discover your next favorite book'}
            </span>
          </div>
        </Alert>
      </Snackbar>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 md:pr-10 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Find Your Favourite Book In Book Galaxy
              </h1>
              <p className="text-xl mb-8 text-indigo-100 leading-relaxed">
                Explore thousands of books from bestselling authors to hidden gems. Your next favorite story is waiting for you.
              </p>
              
              {/* Hero Search Bar */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-indigo-300" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-indigo-400/30 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder="Search for books, authors, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 px-4 py-2 bg-white text-indigo-600 rounded-r-xl font-medium hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Search
                  </button>
                </div>
              </form>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/books"
                  className="inline-flex items-center bg-white text-indigo-600 font-medium px-6 py-3 rounded-xl shadow hover:bg-indigo-50 transition-all"
                >
                  <BookMarked className="w-5 h-5 mr-2" />
                  Browse Books
                </Link>
                <Link
                  to="/announcements"
                  className="inline-flex items-center bg-indigo-500 bg-opacity-30 text-white font-medium px-6 py-3 rounded-xl hover:bg-opacity-40 transition-all border border-indigo-400/30"
                >
                  <Star className="w-5 h-5 mr-2" />
                  New Arrivals
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-72 h-96 md:w-80 md:h-[28rem]">
                {/* Decorative book stack */}
                <div className="absolute top-8 left-4 w-64 h-80 bg-purple-500 rounded-lg shadow-xl transform rotate-6"></div>
                <div className="absolute top-4 left-8 w-64 h-80 bg-indigo-400 rounded-lg shadow-xl transform -rotate-3"></div>
                <div className="absolute top-0 left-0 w-64 h-80 bg-white rounded-lg shadow-xl overflow-hidden">
                  <img
                    src="/assets/1.png"
                    alt="Book Galaxy Hero"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start p-6 rounded-xl">
              <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                <ShoppingBag className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-gray-600">On all orders over $30</p>
              </div>
            </div>
            
            <div className="flex items-start p-6 rounded-xl">
              <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-gray-600">100% secure payment options</p>
              </div>
            </div>
            
            <div className="flex items-start p-6 rounded-xl">
              <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">30-Day Returns</h3>
                <p className="text-gray-600">Shop with confidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">Browse Categories</h2>
            <Link 
              to="/categories" 
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                to={`/books/category/${cat.name.toLowerCase()}`}
                key={cat.name}
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="p-3 bg-indigo-100 rounded-full mb-4 text-indigo-600">
                  {cat.icon}
                </div>
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      {(!user || (user.role !== 'Admin' && user.role !== 'Staff')) && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800">Featured Books</h2>
              <Link 
                to="/books" 
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
              >
                View All Books
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
            
            {error && (
              <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 rounded-lg text-center text-red-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredBooks.map((book) => (
                <Link to={`/book/${book.bookId}`} key={book.bookId} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-100">
                    <div className="relative">
                      {book.isOnSale && (
                        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                          SALE
                        </div>
                      )}
                      <div className="h-56 overflow-hidden">
                        <img
                          src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : 'https://via.placeholder.com/300x400'}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
                      <p className="text-gray-500 text-sm mb-3">{book.author}</p>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(Math.random() * 2) + 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-2">({Math.floor(Math.random() * 100) + 10})</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-baseline">
                          {book.isOnSale && (
                            <span className="text-xs text-gray-500 line-through mr-2">${(book.price * 1.25).toFixed(2)}</span>
                          )}
                          <span className="font-bold text-lg text-indigo-600">${book.price.toFixed(2)}</span>
                        </div>
                        <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2 rounded-full transition-colors">
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {featuredBooks.length === 0 && !error && (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-lg font-medium">No featured books available at the moment.</p>
                <p className="text-sm mt-2">Please check back later for exciting offers!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-indigo-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white">
                <h2 className="text-2xl font-bold mb-4">Subscribe to our Newsletter</h2>
                <p className="text-indigo-100 mb-6">Get updates on new releases, exclusive offers, and reading recommendations.</p>
                <form className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-indigo-400/30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-white text-indigo-600 font-medium px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
              <div className="md:w-1/2 p-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Join our Book Club</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Get early access to new releases</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Exclusive member-only discounts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Monthly curated reading lists</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Virtual author events and readings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;