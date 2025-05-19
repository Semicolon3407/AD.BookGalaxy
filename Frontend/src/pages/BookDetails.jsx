import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBookmark } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { Star, ShoppingCart, Bookmark, Loader2, AlertCircle, BookOpen, Users, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addToCart, updateCartCount } = useCart();
  const { updateBookmarkCount } = useBookmark();
  const { addToast } = useToast();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editInput, setEditInput] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({ title: '', message: '', action: '' });

  useEffect(() => {
    fetchBook();
    fetchReviews();
    if (user?.role === 'Member') {
      checkBookmarkStatus();
      checkCanReview();
    }
  }, [id, user]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/books/${id}`);
      setBook(res.data);
    } catch (err) {
      setError('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/Review/book/${id}`);
      setReviews(res.data);
    } catch (err) {
      setError('Failed to load reviews');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      addToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }
    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId: parseInt(id),
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateCartCount();
      setSnackbarMessage({
        title: 'Added to Cart',
        message: `${book.title} has been added to your cart`
      });
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Add to cart error:', err);
      addToast(err.response?.data?.message || 'Failed to add book to cart', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      addToast('Please login to bookmark books', 'warning');
      navigate('/login');
      return;
    }
    try {
      if (isBookmarked) {
        await axios.delete(`http://localhost:5176/api/Bookmark/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(false);
        setSnackbarMessage({
          title: 'Removed from Bookmarks',
          message: `${book.title} has been removed from your bookmarks`,
          action: 'remove'
        });
        setOpenSnackbar(true);
      } else {
        await axios.post(`http://localhost:5176/api/Bookmark/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(true);
        setSnackbarMessage({
          title: 'Added to Bookmarks',
          message: `${book.title} has been added to your bookmarks`,
          action: 'add'
        });
        setOpenSnackbar(true);
      }
      updateBookmarkCount();
    } catch (err) {
      console.error('Bookmark error:', err);
      addToast(err.response?.data?.message || 'Failed to update bookmark', 'error');
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBookmarked(res.data.some(b => b.bookId === parseInt(id)));
    } catch (err) {
      console.error('Failed to check bookmark status');
    }
  };

  const checkCanReview = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/Review/can-review/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(res.data.canReview);
    } catch (err) {
      setCanReview(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to submit a review', 'warning');
      navigate('/login');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await axios.post(
        'http://localhost:5176/api/Review',
        {
          bookId: book.bookId,
          rating: userReview.rating,
          comment: userReview.comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      addToast('Review submitted successfully', 'success');
      setUserReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.reviewId);
    setEditInput({ rating: review.rating, comment: review.comment });
  };

  const handleEditSubmit = async (reviewId) => {
    try {
      await axios.put(`http://localhost:5176/api/Review/${reviewId}`, {
        rating: editInput.rating,
        comment: editInput.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      setError('Failed to update review');
    }
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditInput({ rating: 5, comment: '' });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`http://localhost:5176/api/Admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const ownReview = user && user.role === 'Member' && reviews.find(r => String(r.memberId) === String(user.memberId));

  if (!book || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
            backgroundColor: snackbarMessage.action === 'remove' ? '#4F46E5' : '#047857',
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
            <span className="text-emerald-100 text-sm mt-0.5">{snackbarMessage.message}</span>
          </div>
        </Alert>
      </Snackbar>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 rounded-lg text-red-600 flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Book Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Book Image */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
              <img
                src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : '/placeholder-book.jpg'}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }}
              />
              {book.isOnSale && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {book.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Book Details */}
            <div className="col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                <p className="text-lg text-gray-600 mt-1">by {book.author}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(book.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {book.averageRating?.toFixed(1) || 'No ratings'} ({reviews.length} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-2xl font-semibold text-indigo-600">${book.price.toFixed(2)}</span>
                {book.isOnSale && (
                  <span className="text-lg text-gray-500 line-through">
                    ${(book.price * (1 + book.discountPercent / 100)).toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed">{book.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>ISBN: {book.isbn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>Genre: {book.genre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Format: {book.format}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Language: {book.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Publisher: {book.publisher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Published: {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : '-'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!user || !book.isAvailableInLibrary || book.stockQuantity <= 0}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{!book.isAvailableInLibrary || book.stockQuantity <= 0 ? 'Not Available' : 'Add to Cart'}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  disabled={!user}
                  className={`py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isBookmarked ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-700' : ''}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              </div>

              {(!book.isAvailableInLibrary || book.stockQuantity <= 0) && (
                <p className="text-sm text-red-600">This book is currently out of stock</p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

          {/* Review Form */}
          {user?.role === 'Member' && canReview && !ownReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setUserReview(prev => ({ ...prev, rating }))}
                        className={`p-1 transition-colors ${userReview.rating >= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                      >
                        <Star className="w-6 h-6" fill={userReview.rating >= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={userReview.comment}
                    onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                    required
                    placeholder="Share your thoughts about this book..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Review Eligibility Message */}
          {!canReview && user?.role === 'Member' && !ownReview && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              You can only review books you have purchased and received.
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this book!</p>
            ) : (
              reviews.map((review) => {
                const isOwnReview = user && user.role === 'Member' &&
                  !!user.memberId && !!review.memberId &&
                  String(user.memberId) === String(review.memberId);
                const isEditing = editingReviewId === review.reviewId;
                return (
                  <motion.div
                    key={review.reviewId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gray-200 pb-6 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{review.memberName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {isEditing ? (
                      <form onSubmit={e => { e.preventDefault(); handleEditSubmit(review.reviewId); }} className="space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setEditInput(prev => ({ ...prev, rating }))}
                                className={`p-1 transition-colors ${editInput.rating >= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                              >
                                <Star className="w-6 h-6" fill={editInput.rating >= rating ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                          <textarea
                            name="comment"
                            value={editInput.comment}
                            onChange={e => setEditInput(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleEditCancel}
                            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-gray-700">{review.comment}</p>
                        {(isOwnReview || user?.role === 'Admin') && (
                          <div className="flex gap-2 mt-3">
                            {isOwnReview && (
                              <button
                                onClick={() => handleEditClick(review)}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                              >
                                Edit
                              </button>
                            )}
                            {(isOwnReview || user?.role === 'Admin') && (
                              <button
                                onClick={() => handleDeleteReview(review.reviewId)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;