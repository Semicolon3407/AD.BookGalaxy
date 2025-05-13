import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BookOpen, Package, User, TrendingUp, Award, Clock, Calendar, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminPanel = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    totalBooks: 0,
    totalMembers: 0,
    totalOrders: 0,
    fulfilledOrders: 0,
    cancelledOrders: 0,
    totalSales: 0,
    outOfStock: 0,
    onSale: 0,
    pendingOrders: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [ordersStatusData, setOrdersStatusData] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [newMembersData, setNewMembersData] = useState([]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          bookRes,
          orderSummaryRes,
          genresRes,
          orderStatusRes,
          monthlySalesRes,
          newMembersRes,
          topBestsellersRes,
          totalSalesRes
        ] = await Promise.all([
          axios.get('http://localhost:5176/api/books', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/order-summary', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/genres', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/order-status', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/monthly-sales', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/new-members', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/top-bestsellers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5176/api/Admin/dashboard/total-sales', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const books = bookRes.data || [];
        const onSale = books.filter(b => b.isOnSale).length;
        const outOfStock = books.filter(b => b.stockQuantity <= 5).length;

        const { totalOrders, fulfilledOrders, cancelledOrders } = orderSummaryRes.data;
        const { totalSales } = totalSalesRes.data;

        setMetrics({
          totalBooks: books.length,
          totalMembers: newMembersRes.data.reduce((sum, m) => sum + m.count, 0),
          totalOrders,
          fulfilledOrders,
          cancelledOrders,
          totalSales: totalSales || 0,
          outOfStock,
          onSale,
          pendingOrders: totalOrders - fulfilledOrders - cancelledOrders
        });

        setSalesData(monthlySalesRes.data || []);
        setOrdersStatusData(orderStatusRes.data || []);
        setBestsellers(topBestsellersRes.data || []);
        setGenreData(genresRes.data || []);
        setNewMembersData(newMembersRes.data || []);

        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [token]);

  const COLORS = ['#6366f1', '#f59e42', '#10b981', '#ef4444', '#fbbf24', '#3b82f6'];

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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Metrics Widgets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Widget 
            title="Total Books" 
            value={metrics.totalBooks} 
            icon={<BookOpen className="w-5 h-5 text-indigo-600" />} 
            trend="up"
          />
          <Widget 
            title="Total Members" 
            value={metrics.totalMembers} 
            icon={<Users className="w-5 h-5 text-indigo-600" />} 
            trend="up"
          />
          <Widget 
            title="Total Orders" 
            value={metrics.totalOrders} 
            icon={<Package className="w-5 h-5 text-indigo-600" />} 
            trend="neutral"
          />
          <Widget 
            title="Total Sales" 
            value={`$${metrics.totalSales.toLocaleString()}`} 
            icon={<TrendingUp className="w-5 h-5 text-indigo-600" />} 
            trend="up"
          />
          <Widget 
            title="Fulfilled Orders" 
            value={metrics.fulfilledOrders} 
            icon={<svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} 
            trend="up"
          />
          <Widget 
            title="Pending Orders" 
            value={metrics.pendingOrders} 
            icon={<Clock className="w-5 h-5 text-indigo-600" />} 
            trend="neutral"
          />
          <Widget 
            title="Cancelled Orders" 
            value={metrics.cancelledOrders} 
            icon={<svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} 
            trend="down"
          />
          <Widget 
            title="Books On Sale" 
            value={metrics.onSale} 
            icon={<ShoppingCart className="w-5 h-5 text-indigo-600" />} 
            trend="neutral"
          />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Over Time */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales</h3>
            <div className="h-80">
              <Line
                data={{
                  labels: salesData.map(item => `${item.year}-${String(item.month).padStart(2, '0')}`),
                  datasets: [
                    {
                      label: 'Sales ($)',
                      data: salesData.map(item => item.total),
                      borderColor: '#6366f1',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      tension: 0.3,
                      fill: true
                    }
                  ]
                }}
                options={lineChartOptions}
              />
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
            <div className="h-80">
              <Pie
                data={{
                  labels: ordersStatusData.map(item => item.status),
                  datasets: [
                    {
                      data: ordersStatusData.map(item => item.count),
                      backgroundColor: COLORS,
                      borderWidth: 1
                    }
                  ]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Books by Genre */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Books by Genre</h3>
            <div className="h-80">
              {genreData.length > 0 ? (
                <Pie
                  data={{
                    labels: genreData.map(item => item.genre),
                    datasets: [
                      {
                        data: genreData.map(item => item.count),
                        backgroundColor: COLORS,
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No genre data available
                </div>
              )}
            </div>
          </div>

          {/* Top Bestsellers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Bestsellers</h3>
            <div className="h-80">
              {bestsellers.length > 0 ? (
                <Bar
                  data={{
                    labels: bestsellers.map(item => item.title),
                    datasets: [
                      {
                        label: 'Copies Sold',
                        data: bestsellers.map(item => item.quantitySold),
                        backgroundColor: '#6366f1'
                      }
                    ]
                  }}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No bestseller data available
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Widget = ({ title, value, icon, trend }) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex items-start">
        <div className="bg-indigo-50 rounded-lg p-2 mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-xs ${trendColors[trend]}`}>
              {trend === 'up' && (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {trend === 'neutral' && (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
              )}
              <span>Last 30 days</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;