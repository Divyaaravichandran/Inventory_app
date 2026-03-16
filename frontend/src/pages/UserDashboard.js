// frontend/src/pages/UserDashboard.js
import React, { useEffect, useState } from 'react';
import UserLayout from '../components/UserLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import {
  FiShoppingBag,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiTruck,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const UserDashboard = () => {
  const { token } = useUserAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [period, token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const ordersRes = await axios.get(`${API_BASE_URL}/api/user/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const completedOrders = orders.filter(order => order.status === 'delivered').length;
      const totalSpent = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      toast.error(msg);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-600" />;
      case 'confirmed': return <FiCheckCircle className="text-blue-600" />;
      case 'processing': return <FiPackage className="text-purple-600" />;
      case 'shipped': return <FiTruck className="text-indigo-600" />;
      case 'delivered': return <FiCheckCircle className="text-green-600" />;
      case 'cancelled': return <FiXCircle className="text-red-600" />;
      default: return <FiClock className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* KPI Cards - same style as Admin (gradient, bold, hover) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={FiShoppingBag}
            title="Total Orders"
            value={String(stats.totalOrders)}
            color="from-blue-500 to-blue-600"
          />
          <KPICard
            icon={FiClock}
            title="Pending Orders"
            value={String(stats.pendingOrders)}
            color="from-amber-500 to-amber-600"
          />
          <KPICard
            icon={FiCheckCircle}
            title="Completed Orders"
            value={String(stats.completedOrders)}
            color="from-green-500 to-green-600"
          />
          <KPICard
            icon={FiDollarSign}
            title="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString()}`}
            color="from-teal-500 to-teal-600"
          />
        </div>

        {/* Order Statistics card - Admin style */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FiActivity className="mr-2 text-primary-600" />
              Order Statistics
            </h3>
            <div className="flex space-x-2">
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    period === p
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <FiActivity className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="text-gray-600">Order trends</p>
              <p className="text-sm text-gray-500">Total: {stats.totalOrders} orders</p>
            </div>
          </div>
        </div>

        {/* Recent Orders - Admin table style (like Dealers / Recent Sales) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FiPackage className="mr-2 text-primary-600" />
              Recent Orders
            </h3>
            <a
              href="/user/orders"
              className="btn-primary text-sm px-4 py-2 inline-flex items-center"
            >
              <FiEye className="mr-1" />
              View All
            </a>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 text-sm text-gray-800 font-medium">#{order.orderNumber}</td>
                      <td className="py-2 text-sm text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 text-sm text-gray-800">{order.items.length} items</td>
                      <td className="py-2 text-sm text-gray-800 text-right">₹{order.totalAmount?.toLocaleString()}</td>
                      <td className="py-2 text-sm text-gray-800">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">No orders yet</p>
              <a href="/user/products" className="btn-primary inline-block">
                Start Shopping
              </a>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

const KPICard = ({ icon: Icon, title, value, color }) => (
  <div className={`card bg-gradient-to-br ${color} text-white transform hover:scale-105 transition-transform duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
        <Icon size={32} />
      </div>
    </div>
  </div>
);

export default UserDashboard;