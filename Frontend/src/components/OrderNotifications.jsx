import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

const OrderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5176/orderhub')
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to OrderHub');

          connection.on('ReceiveOrder', (order) => {
            setNotifications(prev => [{
              id: Math.random(),
              ...order,
              timestamp: new Date(order.timestamp)
            }, ...prev].slice(0, 5)); // Keep only last 5 notifications
          });
        })
        .catch(error => console.log('Error connecting to OrderHub:', error));

      return () => {
        connection.stop();
      };
    }
  }, [connection]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, scale: 0.3, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border-l-4 border-indigo-500 backdrop-blur-md bg-opacity-98 pointer-events-auto"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-lg">
                <Bell className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  New Order Placed!
                </p>
                <p className="text-base text-gray-600">
                  {notification.bookTitle} was just ordered by {notification.memberName}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotifications;
