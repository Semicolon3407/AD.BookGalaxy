import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ShoppingCart from './pages/ShoppingCart';
import Bookmarks from './pages/Bookmarks';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import AdminUsers from './pages/AdminUsers';
import UserOrders from './pages/UserOrders';
import AdminOrders from './pages/AdminOrders';
import StaffDashboard from './pages/StaffDashboard';
import StaffBookManagement from './pages/StaffBookManagement';
import StaffOrderHistory from './pages/StaffOrderHistory';
import Announcements from './pages/Announcements';
import AdminReviewManagement from './pages/AdminReviewManagement';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import AdminBooks from './pages/AdminBooks';
import AdminAnnouncements from './pages/AdminAnnouncements';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useEffect } from 'react';
import OrderNotifications from './components/OrderNotifications';
import OrderSuccess from './pages/OrderSuccess';
import Footer from './components/Footer';

const App = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
  const isMember = user?.role === 'Member';

  return (
    <CartProvider>
      <BookmarkProvider>
        <ToastProvider>
          <OrderNotifications />
          <div className="min-h-screen bg-gray-50">
            {(!isAdminOrStaff && !isLoginOrRegister) && <Navbar />}
            {user && isAdminOrStaff && <Sidebar />}
            <div className={`${isAdminOrStaff ? 'pl-64 pt-0' : (!isLoginOrRegister ? 'pt-16' : '')}`}>
              <div className="min-h-screen pb-24">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/book/:id" element={<BookDetails />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route
                    path="/order-confirmation"
                    element={
                      <ProtectedRoute allowedRoles={['Member']}>
                        <OrderSuccess />
                      </ProtectedRoute>
                    }
                  />

                  {/* Member Routes */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute allowedRoles={['Member']}>
                        <ShoppingCart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookmarks"
                    element={
                      <ProtectedRoute allowedRoles={['Member']}>
                        <Bookmarks />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={['Member']}>
                        <UserOrders />
                      </ProtectedRoute>
                    }
                  />

                  {/* Staff Routes */}
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute allowedRoles={['Staff']}>
                        <StaffDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff/books"
                    element={
                      <ProtectedRoute allowedRoles={['Staff']}>
                        <StaffBookManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff/fulfilled-orders"
                    element={
                      <ProtectedRoute allowedRoles={['Staff']}>
                        <StaffOrderHistory />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reviews"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminReviewManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/books"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminBooks />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/announcements"
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminAnnouncements />
                      </ProtectedRoute>
                    }
                  />


                {/* Not Found */}
                <Route path="*" element={<div className="p-10">Page Not Found</div>} />
                </Routes>
              </div>
              {!isAdminOrStaff && !isLoginOrRegister && <Footer />}
            </div>
          </div>
        </ToastProvider>
      </BookmarkProvider>
    </CartProvider>
  );
};

export default App;