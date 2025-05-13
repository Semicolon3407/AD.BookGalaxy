import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, Loader2, AlertCircle, CheckCircle, User, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminReviews = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      setError('Failed to load books');
    }
  };

  const fetchReviews = async (bookId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`http://localhost:5176/api/Review/book/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleBookChange = (e) => {
    setSelectedBookId(e.target.value);
    if (e.target.value) {
      fetchReviews(e.target.value);
    } else {
      setReviews([]);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`http://localhost:5176/api/Admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Review deleted successfully');
      fetchReviews(selectedBookId);
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  if (loading && !selectedBookId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
              <p className="text-gray-500 mt-1">View and manage book reviews</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 rounded-md text-center text-red-600 flex items-center justify-center text-sm"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 rounded-md text-center text-green-600 flex items-center justify-center text-sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {success}
          </motion.div>
        )}

        {/* Book Selection */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Book</label>
          <select
            value={selectedBookId}
            onChange={handleBookChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            <option value="">-- Select a Book --</option>
            {books.map((book) => (
              <option key={book.bookId} value={book.bookId}>
                {book.title} by {book.author}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews List */}
        {selectedBookId && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center">
                  <Star className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-700">No reviews found</h3>
                  <p className="mt-1 text-gray-500">This book hasn't received any reviews yet.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((review) => (
                    <motion.li 
                      key={review.reviewId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{review.memberName}</h3>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mt-3 text-gray-700">{review.comment}</p>
                      <div className="mt-3 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDeleteReview(review.reviewId)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Delete Review
                        </motion.button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReviews;