import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Calendar, MapPin, CreditCard, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderInfo = location.state?.orderInfo;

  useEffect(() => {
    if (!orderInfo) {
      navigate('/cart');
    }
  }, [orderInfo, navigate]);

  if (!orderInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              Order #{orderInfo.orderId}
            </span>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Order Date</p>
                <p className="text-gray-900">{new Date(orderInfo.orderDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="text-gray-900">Credit Card</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                <p className="text-gray-900">{orderInfo.shippingAddress}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                <p className="text-gray-900">3-5 Business Days</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderInfo.items.map((item) => (
                <div key={item.bookId} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-20">
                    <img
                      src={item.coverImage || '/placeholder-book.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <p>Subtotal</p>
                <p>${orderInfo.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              {orderInfo.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <p>Discount</p>
                  <p>-${orderInfo.discount.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-gray-900 pt-2">
                <p>Total</p>
                <p>${orderInfo.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/books')}
            className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
