import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderManagement = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, fulfilled, cancelled
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5176/api/Orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-500 mt-1">View and manage customer orders</p>
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

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            {['all', 'pending', 'fulfilled', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-all ${
                  filter === status
                    ? 'bg-white border-t border-l border-r border-gray-200 text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">
                  No {filter === 'all' ? '' : filter} orders found
                </h3>
                <p className="mt-1 text-gray-500">
                  {filter === 'all' 
                    ? "When orders are placed, they'll appear here." 
                    : `No ${filter} orders at this time.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <motion.div 
                    key={order.orderId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleOrderExpand(order.orderId)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-indigo-100 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString()} • {order.member?.fullName || 'Guest'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-gray-900">${order.totalPrice?.toFixed(2) || '0.00'}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        {expandedOrder === order.orderId ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedOrder === order.orderId && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                          <ul className="divide-y divide-gray-200">
                            {order.items.map((item, index) => (
                              <li key={index} className="py-2 flex justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-indigo-600">
                                  ${((item.unitPrice || item.price) * item.quantity).toFixed(2)}
                                </p>
                              </li>
                            ))}
                          </ul>

                          {order.notes && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-700 mb-1">Customer Notes</h4>
                              <p className="text-sm text-gray-600">{order.notes}</p>
                            </div>
                          )}

                          <div className="mt-4 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              Last updated: {new Date(order.lastUpdated).toLocaleString()}
                            </p>
                            <div className="flex space-x-2">
                              {order.status !== 'Fulfilled' && (
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleUpdateStatus(order.orderId, 'Fulfilled')}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  Mark as Fulfilled
                                </motion.button>
                              )}
                              {order.status !== 'Cancelled' && (
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleUpdateStatus(order.orderId, 'Cancelled')}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Cancel Order
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
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

export default OrderManagement;