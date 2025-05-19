import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Package, Calendar, User, DollarSign, Loader2 } from 'lucide-react';

const StaffFulfilledOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5176/api/Staff/fulfilled-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load fulfilled orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              <h1 className="text-2xl font-bold text-gray-900">Done Orders</h1>
              <p className="text-gray-500 mt-1">View and manage all fulfilled book orders</p>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Order History</h2>
              <div className="text-sm text-gray-500">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">No fulfilled orders found</h3>
                <p className="mt-1 text-gray-500">Fulfilled orders will appear here once processed.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-md p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            Order #{order.orderId}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <Package className="h-4 w-4" />
                            Fulfilled
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {order.member?.fullName || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${order.totalPrice?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <img
                              src={
                                item.book?.imageUrl
                                  ? `http://localhost:5176${item.book.imageUrl}`
                                  : '/placeholder-book.jpg'
                              }
                              alt={item.book?.title || 'Book'}
                              className="h-16 w-12 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-book.jpg';
                              }}
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {item.book?.title || 'Unknown Title'}
                              </h5>
                              <p className="text-sm text-gray-500">
                                By {item.book?.author || 'Unknown Author'}
                              </p>
                              <div className="mt-1 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Qty: {item.quantity || 1}</span>
                                <span className="text-gray-900">
                                  ${((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffFulfilledOrders;