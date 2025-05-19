import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const StaffPanel = () => {
  const { token, user } = useAuth();
  const location = useLocation();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({ title: '', message: '' });
  const [claimCode, setClaimCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Show welcome message if coming from login
    if (location.search.includes('from=login')) {
      setSnackbarMessage({
        title: 'Welcome Back!',
        message: `Welcome back, ${user?.name || 'Staff'}! You're now in the staff dashboard.`
      });
      setOpenSnackbar(true);
    }
  }, [location, user]);

  const handleFulfillOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'http://localhost:5176/api/Staff/fulfill-order',
        { claimCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(response.data.message);
      setClaimCode('');
      setError('');
    } catch (err) {
      setError('Failed to fulfill order. Please check the claim code.');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            backgroundColor: '#047857',
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Make Order for User</h1>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Make Order</h3>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 rounded-md text-center text-green-600 flex items-center justify-center text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {message}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 rounded-md text-center text-red-600 flex items-center justify-center text-sm"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleFulfillOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Claim Code
                </label>
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  required
                  placeholder="Enter claim code"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Fulfill Order
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffPanel;