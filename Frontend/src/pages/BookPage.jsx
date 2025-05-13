import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBookmark } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Star, Search, Filter, ChevronLeft, ChevronRight, Loader2, ShoppingCart, Bookmark, Award, TrendingUp, Calendar, Clock, Gift } from 'lucide-react';
import Select from 'react-select';
import Slider from 'rc-slider';
import { motion, AnimatePresence } from 'framer-motion';
import 'rc-slider/assets/index.css';

const placeholderImg = '/placeholder-book.jpg';

const BooksPage = () => {
  const { user, token, logout } = useAuth();
  const { updateCartCount, addToCart } = useCart();
  const { updateBookmarkCount } = useBookmark();
  const { addToast } = useToast();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  // Filter states
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formats, setFormats] = useState([]);
  const [publishers, setPublishers] = useState([]);
  // Multi-select state
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  // Range state
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [inStock, setInStock] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortDescending, setSortDescending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAwardWinner, setIsAwardWinner] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [newReleases, setNewReleases] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [deals, setDeals] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [a, g, l, f, p] = await Promise.all([
          axios.get('http://localhost:5176/api/books/authors'),
          axios.get('http://localhost:5176/api/books/genres'),
          axios.get('http://localhost:5176/api/books/languages'),
          axios.get('http://localhost:5176/api/books/formats'),
          axios.get('http://localhost:5176/api/books/publishers'),
        ]);
        setAuthors(a.data);
        setGenres(g.data);
        setLanguages(l.data);
        setFormats(f.data);
        setPublishers(p.data);
      } catch (err) {
        // ignore
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search or filter
  }, [query, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending]);

  useEffect(() => {
    fetchBooks();
    if (user && user.role === 'Member') fetchBookmarks();
  }, [query, currentPage, user, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending, isAwardWinner, isBestseller, newReleases, newArrivals, comingSoon, deals]);

  useEffect(() => {
    if (resetFilters) {
      setQuery('');
      setPriceRange([0, 1000]);
      setRatingRange([0, 5]);
      setSelectedLanguages([]);
      setSelectedAuthors([]);
      setSelectedGenres([]);
      setSelectedFormats([]);
      setSelectedPublishers([]);
      setSortBy('title');
      setSortDescending(false);
      setCurrentPage(1);
      setIsAwardWinner(false);
      setIsBestseller(false);
      setNewReleases(false);
      setNewArrivals(false);
      setComingSoon(false);
      setDeals(false);
      setResetFilters(false);
      fetchBooks();
    }
  }, [resetFilters]);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data.map(b => b.bookId));
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      addToast('Failed to load bookmarks. Please try again later.', 'error');
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('search', query);
      params.append('minPrice', priceRange[0]);
      params.append('maxPrice', priceRange[1]);
      params.append('minRating', ratingRange[0]);
      params.append('sortBy', sortBy);
      params.append('sortDescending', sortDescending);
      params.append('page', currentPage);
      params.append('pageSize', 9);
      if (inStock) params.append('inStock', true);
      if (inLibrary) params.append('isAvailableInLibrary', true);
      if (isAwardWinner) params.append('isAwardWinner', true);
      if (isBestseller) params.append('isBestseller', true);
      if (newReleases) params.append('newReleases', true);
      if (newArrivals) params.append('newArrivals', true);
      if (comingSoon) params.append('comingSoon', true);
      if (deals) params.append('deals', true);
      if (selectedLanguages.length > 0) {
        selectedLanguages.forEach(lang => params.append('languages[]', lang));
      }
      if (selectedAuthors.length > 0) {
        selectedAuthors.forEach(author => params.append('authors[]', author));
      }
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => params.append('genres[]', genre));
      }
      if (selectedFormats.length > 0) {
        selectedFormats.forEach(format => params.append('formats[]', format));
      }
      if (selectedPublishers.length > 0) {
        selectedPublishers.forEach(publisher => params.append('publishers[]', publisher));
      }
      const res = await axios.get(`http://localhost:5176/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setBooks(res.data);
      const totalCount = parseInt(res.headers['x-total-count'] || '0');
      setTotalPages(Math.max(1, Math.ceil(totalCount / 9)));
    } catch (err) {
      console.error('Failed to load books:', err);
      addToast('Failed to load books. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isBookBookmarked = (bookId) => bookmarks.includes(bookId);

  const handleToggleBookmark = async (bookId) => {
    if (!user || user.role !== 'Member') {
      addToast('Please login as a member to bookmark books', 'warning');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      if (isBookBookmarked(bookId)) {
        // Remove bookmark
        await axios.delete(`http://localhost:5176/api/Bookmark/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => prev.filter(id => id !== bookId));
        addToast('Book removed from bookmarks', 'success');
      } else {
        // Add bookmark
        await axios.post(`http://localhost:5176/api/Bookmark/${bookId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => [...prev, bookId]);
        addToast('Book added to bookmarks', 'success');
      }
      updateBookmarkCount();
    } catch (err) {
      console.error('Bookmark error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login', { state: { from: location.pathname } });
      } else {
        addToast(err.response?.data?.message || 'Failed to update bookmark', 'error');
      }
    }
  };

  const handleAddToCart = async (bookId) => {
    if (!user || !bookId) {
      addToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateCartCount(); // Update the cart count in the navbar
      addToast('Book added to cart successfully', 'success');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      addToast(err.response?.data?.message || 'Failed to add book to cart', 'error');
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  // Debug log for pagination
  console.log('totalPages:', totalPages, 'currentPage:', currentPage, 'books.length:', books.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Catalog</h1>
              <p className="text-gray-500 mt-1">Browse our collection of books</p>
            </div>
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  onClick={() => setResetFilters(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Reset all
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsAwardWinner(!isAwardWinner);
                        setIsBestseller(false);
                        setNewReleases(false);
                        setNewArrivals(false);
                        setComingSoon(false);
                        setDeals(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                        isAwardWinner ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Award className="h-4 w-4" />
                      Award Winners
                    </button>
                    <button
                      onClick={() => {
                        setIsBestseller(!isBestseller);
                        setIsAwardWinner(false);
                        setNewReleases(false);
                        setNewArrivals(false);
                        setComingSoon(false);
                        setDeals(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                        isBestseller ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      Bestsellers
                    </button>
                    <button
                      onClick={() => {
                        setNewReleases(!newReleases);
                        setIsAwardWinner(false);
                        setIsBestseller(false);
                        setNewArrivals(false);
                        setComingSoon(false);
                        setDeals(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                        newReleases ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      New Releases
                    </button>
                    <button
                      onClick={() => {
                        setNewArrivals(!newArrivals);
                        setIsAwardWinner(false);
                        setIsBestseller(false);
                        setNewReleases(false);
                        setComingSoon(false);
                        setDeals(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                        newArrivals ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      New Arrivals
                    </button>
                    <button
                      onClick={() => {
                        setComingSoon(!comingSoon);
                        setIsAwardWinner(false);
                        setIsBestseller(false);
                        setNewReleases(false);
                        setNewArrivals(false);
                        setDeals(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                        comingSoon ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      Coming Soon
                    </button>
                    <button
                      onClick={() => {
                        setDeals(!deals);
                        setIsAwardWinner(false);
                        setIsBestseller(false);
                        setNewReleases(false);
                        setNewArrivals(false);
                        setComingSoon(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                        deals ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Gift className="h-4 w-4" />
                      Special Deals
                    </button>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Price Range: <span className="text-indigo-600">${priceRange[0]} - ${priceRange[1]}</span>
                  </h3>
                  <Slider
                    range
                    min={0}
                    max={1000}
                    step={1}
                    value={priceRange}
                    onChange={setPriceRange}
                    allowCross={false}
                    className="px-2"
                    trackStyle={[{ backgroundColor: '#6366f1', height: '4px' }]}
                    handleStyle={[
                      { 
                        borderColor: '#6366f1', 
                        backgroundColor: 'white',
                        width: '16px',
                        height: '16px',
                        marginTop: '-6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }
                    ]}
                    railStyle={{ backgroundColor: '#e5e7eb', height: '4px' }}
                  />
                </div>

                {/* Rating Range */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Rating: <span className="text-indigo-600">{ratingRange[0]} - {ratingRange[1]} stars</span>
                  </h3>
                  <Slider
                    range
                    min={0}
                    max={5}
                    step={0.1}
                    value={ratingRange}
                    onChange={setRatingRange}
                    allowCross={false}
                    className="px-2"
                    trackStyle={[{ backgroundColor: '#6366f1', height: '4px' }]}
                    handleStyle={[
                      { 
                        borderColor: '#6366f1', 
                        backgroundColor: 'white',
                        width: '16px',
                        height: '16px',
                        marginTop: '-6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }
                    ]}
                    railStyle={{ backgroundColor: '#e5e7eb', height: '4px' }}
                  />
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={inStock}
                        onChange={e => setInStock(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                        In Stock Only
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="inLibrary"
                        checked={inLibrary}
                        onChange={e => setInLibrary(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="inLibrary" className="ml-2 text-sm text-gray-700">
                        Available in Library
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Sort By</h3>
                  <div className="space-y-2">
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="title">Title (A-Z)</option>
                      <option value="date">Publication Date</option>
                      <option value="price">Price</option>
                      <option value="popularity">Popularity</option>
                    </select>
                    <div className="flex items-center bg-gray-100 rounded-md p-1">
                      <button
                        onClick={() => setSortDescending(false)}
                        className={`flex-1 px-3 py-1 text-sm rounded ${
                          !sortDescending ? 'bg-white shadow text-indigo-600 font-medium' : 'text-gray-600'
                        }`}
                      >
                        Asc
                      </button>
                      <button
                        onClick={() => setSortDescending(true)}
                        className={`flex-1 px-3 py-1 text-sm rounded ${
                          sortDescending ? 'bg-white shadow text-indigo-600 font-medium' : 'text-gray-600'
                        }`}
                      >
                        Desc
                      </button>
                    </div>
                  </div>
                </div>

                {/* Multi-select Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Authors</h3>
                  <Select
                    isMulti
                    options={authors.map(a => ({ value: a, label: a }))}
                    value={selectedAuthors}
                    onChange={setSelectedAuthors}
                    placeholder="Select authors..."
                    className="text-sm"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '36px',
                        borderRadius: '6px',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#6366f1'
                        }
                      })
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Genres</h3>
                  <Select
                    isMulti
                    options={genres.map(g => ({ value: g, label: g }))}
                    value={selectedGenres}
                    onChange={setSelectedGenres}
                    placeholder="Select genres..."
                    className="text-sm"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '36px',
                        borderRadius: '6px',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#6366f1'
                        }
                      })
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Languages</h3>
                  <Select
                    isMulti
                    options={languages.map(l => ({ value: l, label: l }))}
                    value={selectedLanguages}
                    onChange={setSelectedLanguages}
                    placeholder="Select languages..."
                    className="text-sm"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '36px',
                        borderRadius: '6px',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#6366f1'
                        }
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Books Grid */}
          <div className="flex-1">
            {/* Error and Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 rounded-md text-center text-red-600 flex items-center justify-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 rounded-md text-center text-green-600 flex items-center justify-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Books Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading books...</p>
              </div>
            ) : books.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="max-w-md mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No books found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any books matching your criteria.
                  </p>
                  <button
                    onClick={() => setResetFilters(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {books.map((book, index) => (
                    <motion.div
                      key={book.bookId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                      className="group"
                    >
                      <Link to={`/book/${book.bookId}`} className="block h-full">
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-200">
                          <div className="relative">
                            {book.isOnSale && (
                              <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                                SALE
                              </div>
                            )}
                            <div className="h-48 overflow-hidden bg-gray-100">
                              <img
                                src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                              />
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 leading-snug">{book.title}</h3>
                            <p className="text-gray-500 text-sm mb-2 line-clamp-1">{book.author}</p>
                            
                            {/* Rating */}
                            <div className="flex items-center mb-3">
                              <div className="flex items-center mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < Math.floor(book.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {book.averageRating ? book.averageRating.toFixed(1) : 'No'} reviews
                              </span>
                            </div>
                            
                            {/* Price and Actions */}
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-baseline">
                                {book.isOnSale && (
                                  <span className="text-xs text-gray-500 line-through mr-2">${(book.price * 1.25).toFixed(2)}</span>
                                )}
                                <span className="font-semibold text-indigo-600">${book.price?.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleToggleBookmark(book.bookId);
                                  }}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    isBookBookmarked(book.bookId)
                                      ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                  aria-label={isBookBookmarked(book.bookId) ? "Remove bookmark" : "Add bookmark"}
                                >
                                  <Bookmark className={`h-4 w-4 ${isBookBookmarked(book.bookId) ? 'fill-yellow-400' : ''}`} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleAddToCart(book.bookId);
                                  }}
                                  disabled={!user || !book.isAvailableInLibrary || book.stockQuantity <= 0}
                                  className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Add to cart"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Availability */}
                            {(!book.isAvailableInLibrary || book.stockQuantity <= 0) && (
                              <p className="mt-2 text-xs text-red-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Currently unavailable
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-10 flex items-center justify-center space-x-2"
                  >
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-indigo-600 hover:bg-indigo-50 bg-white shadow-sm'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      // Calculate page number based on current page to show limited pagination
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-indigo-600 hover:bg-indigo-50 bg-white shadow-sm'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-1 text-gray-500">...</span>
                    )}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-indigo-600 hover:bg-indigo-50 bg-white shadow-sm'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-indigo-600 hover:bg-indigo-50 bg-white shadow-sm'
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
  
};

export default BooksPage;
