import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';
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
  const [isEligibleForLoyaltyDiscount, setIsEligibleForLoyaltyDiscount] = useState(false);
  const [requiredOrders, setRequiredOrders] = useState(10);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({ title: '', message: '', action: '' });
  
  // Calculate all discounts and totals using useMemo
  const {
    subtotal,
    totalBookDiscount,
    afterBookDiscount,
    totalQuantity,
    bulkDiscount,
    loyaltyDiscount,
    finalTotal
  } = useMemo(() => {
    // Calculate base subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate book-specific discounts
    const totalBookDiscount = cart.reduce((sum, item) => {
      if (item.isOnSale && item.discountPercent > 0) {
        return sum + ((item.price * item.discountPercent / 100) * item.quantity);
      }
      return sum;
    }, 0);
    
    const afterBookDiscount = subtotal - totalBookDiscount;
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate bulk purchase discount
    const bulkDiscount = totalQuantity >= 100 ? afterBookDiscount * 0.10 :
                        totalQuantity >= 10 ? afterBookDiscount * 0.10 :
                        totalQuantity >= 5 ? afterBookDiscount * 0.05 :
                        0;
    
    // Calculate loyalty discount
    const loyaltyDiscount = fulfilledOrders >= 10 ? (afterBookDiscount - bulkDiscount) * 0.10 : 0;
    
    // Calculate final total
    const finalTotal = afterBookDiscount - bulkDiscount - loyaltyDiscount;
    
    return {
      subtotal,
      totalBookDiscount,
      afterBookDiscount,
      totalQuantity,
      bulkDiscount,
      loyaltyDiscount,
      finalTotal
    };
  }, [cart, fulfilledOrders]);

  useEffect(() => {
    fetchCart();
    checkDiscountEligibility();
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

  const checkDiscountEligibility = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Discount/check-eligibility', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFulfilledOrders(res.data.fulfilledOrderCount);
      setIsEligibleForLoyaltyDiscount(res.data.isEligibleForLoyaltyDiscount);
      setRequiredOrders(res.data.requiredOrderCount);
    } catch (err) {
      console.error('Failed to check discount eligibility:', err);
      setFulfilledOrders(0);
      setIsEligibleForLoyaltyDiscount(false);
      setRequiredOrders(10);
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
      setSnackbarMessage({
        title: 'Cart Updated',
        message: 'Your cart has been updated successfully',
        action: 'success'
      });
      setOpenSnackbar(true);
      fetchCart();
      updateCartCount();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      addToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      // Get the book details before removing
      const book = cart.find(item => item.bookId === bookId);
      
      await axios.delete(`http://localhost:5176/api/Cart/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbarMessage({
        title: 'Removed from Cart',
        message: `${book.title} has been removed from your cart`,
        action: 'remove'
      });
      setOpenSnackbar(true);
      
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
      
      setSnackbarMessage({
        title: 'Cart Cleared',
        message: 'All items have been removed from your cart',
        action: 'clear'
      });
      setOpenSnackbar(true);
      
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
      
      // Get the full order info with items details
      const orderDetails = {
        ...res.data,
        items: cart.map(item => ({
          bookId: item.bookId,
          title: item.title,
          coverImage: item.coverImage,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: subtotal,
        discount: totalBookDiscount + bulkDiscount + loyaltyDiscount,
        total: finalTotal,
        shippingAddress: user.address || 'Default Shipping Address'
      };
      
      setOrderInfo(orderDetails);
      setCart([]);
      updateCartCount();
      
      // Navigate to order confirmation page
      navigate('/order-confirmation', {
        state: { orderInfo: orderDetails },
        replace: true
      });
    } catch (err) {
      console.error('Failed to place order:', err);
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };



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
          severity={snackbarMessage.action === 'remove' ? 'error' : 'success'}
          variant="filled"
          sx={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: snackbarMessage.action === 'remove' ? '#DC2626' : '#047857',
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
            <span className={`${snackbarMessage.action === 'remove' ? 'text-red-100' : 'text-emerald-100'} text-sm mt-0.5`}>{snackbarMessage.message}</span>
          </div>
        </Alert>
      </Snackbar>
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
                      {bulkDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>
                            {totalQuantity >= 100 ? '10% Bulk Discount (100+ books)' :
                             totalQuantity >= 10 ? '10% Bulk Discount (10+ books)' :
                             '5% Bulk Discount (5+ books)'}
                          </span>
                          <span>-${bulkDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      {isEligibleForLoyaltyDiscount && (
                        <div className="flex justify-between text-green-600">
                          <span>10% Loyalty Discount</span>
                          <span>-${((afterBookDiscount - fivePercent) * 0.10).toFixed(2)}</span>
                        </div>
                      )}
                      {!isEligibleForLoyaltyDiscount && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-gray-500 text-xs">
                            <span>Loyalty Discount Progress ({fulfilledOrders}/{requiredOrders} orders)</span>
                            <span>0.00</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((fulfilledOrders / requiredOrders) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Complete {requiredOrders - fulfilledOrders} more order{requiredOrders - fulfilledOrders !== 1 ? 's' : ''} to unlock 10% loyalty discount
                          </p>
                        </div>
                      )}
                      {loyaltyDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>10% Loyalty Discount</span>
                          <span>-${loyaltyDiscount.toFixed(2)}</span>
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