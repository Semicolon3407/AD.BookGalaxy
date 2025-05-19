import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBookmark } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { Bookmark, ShoppingCart, Eye, Loader2, AlertCircle, CheckCircle2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';

const placeholderImg = '/placeholder-book.jpg';

const Bookmarks = () => {
  const { token, user } = useAuth();
  const { updateBookmarkCount } = useBookmark();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookId, setExpandedBookId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({ title: '', message: '', action: '' });

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      addToast('Failed to load bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookId) => {
    try {
      // Get book details before removing
      const book = bookmarks.find(b => b.bookId === bookId);
      
      await axios.delete(`http://localhost:5176/api/Bookmark/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(prev => prev.filter(b => b.bookId !== bookId));
      await updateBookmarkCount();
      
      setSnackbarMessage({
        title: 'Removed from Bookmarks',
        message: `${book.title} has been removed from your bookmarks`,
        action: 'remove'
      });
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      addToast('Failed to remove bookmark', 'error');
    }
  };

  const handleAddToCart = async (bookId) => {
    if (!user || user.role !== 'Member') {
      addToast('Please login as a member to add books to cart', 'warning');
      navigate('/login', { state: { from: '/bookmarks' } });
      return;
    }
    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get the book title for the notification
      const book = bookmarks.find(b => b.bookId === bookId);
      setSnackbarMessage({
        title: 'Added to Cart',
        message: `${book.title} has been added to your cart`
      });
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      addToast('Failed to add book to cart', 'error');
    }
  };

  const toggleExpand = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-600 text-lg">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
            backgroundColor: '#4F46E5',
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
            <span className="font-medium">{snackbarMessage.title}</span>
            <span className="text-indigo-100 text-sm mt-0.5">{snackbarMessage.message}</span>
          </div>
        </Alert>
      </Snackbar>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <Bookmark className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Your Bookmarks</h1>
          </div>
          {bookmarks.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {bookmarks.length} {bookmarks.length === 1 ? 'book' : 'books'} saved
            </p>
          )}
        </header>

        {/* Main Content */}
        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-8 text-center"
          >
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500 mb-6">Start saving your favorite books to read them later.</p>
            <button
              onClick={() => navigate('/books')}
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Books
            </button>
          </motion.div>
        ) : (
          <section className="bg-white rounded-lg shadow-sm">
            <AnimatePresence>
              {bookmarks.map((book, index) => (
                <motion.div
                  key={book.bookId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-200 last:border-0"
                >
                  <button
                    onClick={() => toggleExpand(book.bookId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded-md"
                        onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                      />
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-gray-900">{book.title}</h3>
                        <p className="text-xs text-gray-600">{book.author}</p>
                      </div>
                    </div>
                    {expandedBookId === book.bookId ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedBookId === book.bookId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-gray-50"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                            alt={book.title}
                            className="w-24 h-36 object-cover rounded-md"
                            onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                          />
                          <div className="flex-1">
                            <Link to={`/book/${book.bookId}`}>
                              <h3 className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                {book.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">By {book.author}</p>
                            {book.discountPercent > 0 && (
                              <span className="inline-flex mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                {book.discountPercent}% OFF
                              </span>
                            )}
                            <div className="mt-3 flex justify-between items-center">
                              <div>
                                {book.discountPercent > 0 ? (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">${book.price?.toFixed(2)}</span>
                                    <span className="ml-2 text-sm font-semibold text-indigo-600">
                                      ${(book.price * (1 - book.discountPercent / 100)).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-semibold text-indigo-600">${book.price?.toFixed(2)}</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {book.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                              <Link
                                to={`/book/${book.bookId}`}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Link>
                              <button
                                onClick={() => handleAddToCart(book.bookId)}
                                disabled={!book.isAvailableInLibrary || book.stockQuantity <= 0}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </button>
                              <button
                                onClick={() => handleRemoveBookmark(book.bookId)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                              >
                                <Bookmark className="w-4 h-4 fill-yellow-700" />
                                Remove Bookmark
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        )}

        {/* Floating Action Bar */}
        {bookmarks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 lg:static lg:shadow-none lg:mt-6 lg:bg-transparent"
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-600">
                {bookmarks.length} {bookmarks.length === 1 ? 'book' : 'books'} bookmarked
              </span>
              <button
                onClick={() => navigate('/books')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Browse More Books
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;