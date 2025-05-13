import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const placeholderImg = '/placeholder-book.jpg';

const Cart = () => {
  const { token, user } = useAuth();
  const { updateCartCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [fulfilledOrders, setFulfilledOrders] = useState(0);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  useEffect(() => {
    fetchCart();
    fetchFulfilledOrders();
    // eslint-disable-next-line
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5176/api/Cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      addToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFulfilledOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Orders/fulfilled-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFulfilledOrders(res.data.fulfilledCount);
    } catch (err) {
      console.error('Failed to fetch fulfilled orders:', err);
      setFulfilledOrders(0);
    }
  };

  const handleUpdateQuantity = async (bookId, quantity) => {
    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Cart updated successfully', 'success');
      fetchCart();
      updateCartCount();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      addToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      await axios.delete(`http://localhost:5176/api/Cart/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Item removed from cart', 'success');
      fetchCart();
      updateCartCount();
    } catch (err) {
      console.error('Failed to remove item:', err);
      addToast('Failed to remove item from cart', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await axios.delete('http://localhost:5176/api/Cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Cart cleared successfully', 'success');
      fetchCart();
      updateCartCount();
    } catch (err) {
      console.error('Failed to clear cart:', err);
      addToast('Failed to clear cart', 'error');
    }
  };

  const handleCheckout = async () => {
    setOrderInfo(null);
    if (cart.length === 0) {
      addToast('Your cart is empty', 'warning');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const items = cart.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity
      }));
      const res = await axios.post('http://localhost:5176/api/Orders', {
        items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderInfo(res.data);
      addToast('Order placed successfully! A bill and claim code have been sent to your email.', 'success');
      setCart([]);
    } catch (err) {
      console.error('Failed to place order:', err);
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalBookDiscount = cart.reduce((sum, item) => {
    if (item.isOnSale && item.discountPercent > 0) {
      return sum + ((item.price * item.discountPercent / 100) * item.quantity);
    }
    return sum;
  }, 0);
  const afterBookDiscount = subtotal - totalBookDiscount;
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const fivePercent = totalQuantity >= 5 ? afterBookDiscount * 0.05 : 0;
  const tenPercent = fulfilledOrders >= 10 ? (afterBookDiscount - fivePercent) * 0.10 : 0;
  const finalTotal = afterBookDiscount - fivePercent - tenPercent;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          </div>
          {cart.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </header>

        {/* Main Content */}
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-8 text-center"
          >
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't added any books to your cart yet.</p>
            <button
              onClick={() => navigate('/books')}
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Books
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={item.bookId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="py-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl ? `http://localhost:5176${item.imageUrl}` : placeholderImg}
                        alt={item.bookTitle}
                        className="w-16 h-24 object-cover rounded-md"
                        onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-medium text-gray-900">{item.bookTitle}</h3>
                            <p className="text-sm text-gray-600">{item.author}</p>
                            {item.isOnSale && item.discountPercent > 0 && (
                              <span className="inline-flex mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                {item.discountPercent}% OFF
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.bookId)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.bookId, Math.max(1, item.quantity - 1))}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-3 h-3 text-gray-600" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                          <div className="text-right">
                            {item.isOnSale && item.discountPercent > 0 ? (
                              <>
                                <p className="text-xs text-gray-500 line-through">${(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-sm font-semibold text-indigo-600">
                                  ${(item.price * (1 - item.discountPercent / 100) * item.quantity).toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-semibold text-indigo-600">${(item.price * item.quantity).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>

            {/* Order Summary */}
            <section className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                className="w-full flex justify-between items-center p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                {isSummaryOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <AnimatePresence>
                {isSummaryOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {totalBookDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Book Discounts</span>
                          <span>-${totalBookDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      {fivePercent > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>5% Bulk Discount</span>
                          <span>-${fivePercent.toFixed(2)}</span>
                        </div>
                      )}
                      {tenPercent > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>10% Loyalty Discount</span>
                          <span>-${tenPercent.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-gray-900">
                          <span className="font-semibold">Total</span>
                          <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {orderInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-green-800">Order Confirmation</h3>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="flex justify-between">
                            <span>Order ID:</span>
                            <span className="font-medium">{orderInfo.orderId}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Total Paid:</span>
                            <span className="font-medium">
                              ${orderInfo.totalAmount?.toFixed(2) || orderInfo.totalPrice?.toFixed(2)}
                            </span>
                          </p>
                          {orderInfo.claimCode && (
                            <p className="flex justify-between">
                              <span>Claim Code:</span>
                              <span className="font-medium">{orderInfo.claimCode}</span>
                            </p>
                          )}
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-green-600">
                          {orderInfo.appliedFivePercentDiscount && (
                            <p>✓ 5% discount applied for 5+ books</p>
                          )}
                          {orderInfo.appliedTenPercentDiscount && (
                            <p>✓ 10% loyalty discount applied</p>
                          )}
                        </div>
                        <p className="mt-3 text-sm text-gray-600">A bill and claim code have been sent to your email.</p>
                        <button
                          onClick={() => navigate('/orders')}
                          className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          View My Orders
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        )}

        {/* Floating Checkout Bar */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 lg:static lg:shadow-none lg:mt-6 lg:bg-transparent"
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Total: <span className="text-lg font-bold text-indigo-600">${finalTotal.toFixed(2)}</span>
                </span>
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  disabled={isPlacingOrder}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Checkout
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Cart;