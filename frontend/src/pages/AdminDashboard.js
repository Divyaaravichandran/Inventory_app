import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiPackage,
  FiTrendingUp,
  FiBox,
  FiLayers,
  FiAlertCircle,
  FiUsers,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [alerts, setAlerts] = useState([]);
  const [paddyStock, setPaddyStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealerSummary, setDealerSummary] = useState({ count: 0, active: 0 });
  const [ordersSummary, setOrdersSummary] = useState({ sales: 0, dealer: 0 });
  const [showAllPaddyStock, setShowAllPaddyStock] = useState(false);
  const [showAllRecentSales, setShowAllRecentSales] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
    fetchAlerts();
    fetchPaddyStock();
    fetchRecentSales();
    fetchDealerSummary();
    fetchOrdersSummary();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/charts?period=${period}`);
      setChartData(response.data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/alerts`);
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const fetchPaddyStock = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/paddy/stock`);
      setPaddyStock(response.data.byType || []);
    } catch (error) {
      console.error('Failed to load paddy stock:', error);
    }
  };

  const fetchRecentSales = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sales/recent?limit=5');
      setRecentSales(response.data);
    } catch (error) {
      console.error('Failed to load recent sales:', error);
    }
  };

  const fetchDealerSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dealers`);
      const all = res.data || [];
      const active = all.filter((d) => d.status === 'active').length;
      setDealerSummary({ count: all.length, active });
    } catch (error) {
      // silent fail; dealers section is additive
    }
  };

  const fetchOrdersSummary = async () => {
    try {
      const [salesRes, dealerRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/sales`),
        axios.get(`${API_BASE_URL}/api/dealer-orders`),
      ]);
      setOrdersSummary({
        sales: (salesRes.data || []).length,
        dealer: (dealerRes.data || []).length,
      });
    } catch (error) {
      console.error('Failed to load orders summary:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const kpis = dashboardData?.kpis || {};
  const profitLoss = dashboardData?.profitLoss || {};

  const chartDataFormatted = chartData
    ? [
        ...(chartData.paddyInward || []).map((item) => ({
          date: item._id,
          paddy: item.total,
          riceProduced: (chartData.riceProduced || []).find((r) => r._id === item._id)?.total || 0,
          riceSold: (chartData.riceSold || []).find((r) => r._id === item._id)?.total || 0,
        })),
      ]
    : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={FiPackage}
            title="Paddy Stock"
            value={`${(kpis.paddyStock || 0).toFixed(2)} tons`}
            color="from-blue-500 to-blue-600"
          />
          <KPICard
            icon={FiBox}
            title="Rice Stock"
            value={`${(kpis.riceStock || 0).toFixed(2)} kg`}
            color="from-green-500 to-green-600"
          />
          <KPICard
            icon={FiLayers}
            title="Rice Bags Stock"
            value={`${Object.values(kpis.bagsStock || {}).reduce((a, b) => a + b, 0)} bags`}
            color="from-orange-500 to-orange-600"
          />
          <KPICard
            icon={FiUsers}
            title="Dealer Orders"
            value={`${ordersSummary.dealer}`}
            color="from-teal-500 to-teal-600"
          />
        </div>

        {/* Bag Stock by Size */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            icon={FiBox}
            title="5kg Bags"
            value={`${kpis.bagsStock?.['5kg'] || 0}`}
            color="from-purple-500 to-purple-600"
            small
          />
          <KPICard
            icon={FiBox}
            title="10kg Bags"
            value={`${kpis.bagsStock?.['10kg'] || 0}`}
            color="from-purple-500 to-purple-600"
            small
          />
          <KPICard
            icon={FiBox}
            title="25kg Bags"
            value={`${kpis.bagsStock?.['25kg'] || 0}`}
            color="from-purple-500 to-purple-600"
            small
          />
          <KPICard
            icon={FiBox}
            title="75kg Bags"
            value={`${kpis.bagsStock?.['75kg'] || 0}`}
            color="from-purple-500 to-purple-600"
            small
          />
        </div>

                {/* Profit/Loss Summary */}
        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FiTrendingUp className="mr-2 text-primary-600" />
              Overall Profit / Loss
            </h3>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">Total Sales Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{(profitLoss.totalSalesRevenue || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">Total Purchase Cost</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{(profitLoss.totalPurchaseCost || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">Net Profit / Loss</p>
              <p className={`text-2xl font-bold ${(profitLoss.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(profitLoss.profitLoss || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Dealers Section */}

        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FiUsers className="mr-2 text-primary-600" />
            Dealers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <p className="text-sm text-gray-600">Total Dealers</p>
              <p className="text-2xl font-bold text-gray-800">
                {dealerSummary.count}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Dealers</p>
              <p className="text-2xl font-bold text-gray-800">
                {dealerSummary.active}
              </p>
            </div>
            <div className="flex md:justify-end">
              <a
                href="/admin/dealers"
                className="btn-primary text-sm px-4 py-2"
              >
                Manage Dealers
              </a>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FiAlertCircle className="mr-2 text-amber-500" />
              Alerts & Notifications
            </h3>
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'warning'
                      ? 'bg-amber-50 border-amber-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Overview Reports</h3>
            <div className="flex space-x-2">
              {['daily', 'monthly'].map((p) => (
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

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataFormatted}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="paddy" fill="#3b82f6" name="Paddy Inward (tons)" />
                <Bar dataKey="riceProduced" fill="#8b5cf6" name="Rice Produced (kg)" />
                <Bar dataKey="riceSold" fill="#10b981" name="Rice Sold (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paddy Stock Details */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Paddy Stock Details</h3>
              {paddyStock.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllPaddyStock((v) => !v)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showAllPaddyStock ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Paddy Type</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Quantity (tons)</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllPaddyStock ? paddyStock : paddyStock.slice(0, 5)).length > 0 ? (
                    (showAllPaddyStock ? paddyStock : paddyStock.slice(0, 5)).map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 text-sm text-gray-800">{item._id}</td>
                        <td className="py-2 text-sm text-gray-800 text-right">{item.totalWeight?.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-4 text-center text-gray-500">No paddy stock data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Sales</h3>
              {recentSales.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllRecentSales((v) => !v)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showAllRecentSales ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Rice Type</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllRecentSales ? recentSales : recentSales.slice(0, 5)).length > 0 ? (
                    (showAllRecentSales ? recentSales : recentSales.slice(0, 5)).map((sale, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 text-sm text-gray-800">{sale.customerName}</td>
                        <td className="py-2 text-sm text-gray-800">{sale.riceType}</td>
                        <td className="py-2 text-sm text-gray-800 text-right">{sale.quantity} kg</td>
                        <td className="py-2 text-sm text-gray-800 text-right">₹{sale.totalAmount?.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-500">No recent sales</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const KPICard = ({ icon: Icon, title, value, color, small = false }) => (
  <div className={`card bg-gradient-to-br ${color} text-white transform hover:scale-105 transition-transform`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`${small ? 'text-xs' : 'text-sm'} opacity-90 mb-1`}>{title}</p>
        <p className={`${small ? 'text-2xl' : 'text-3xl'} font-bold`}>{value}</p>
      </div>
      <div className={`${small ? 'w-12 h-12' : 'w-16 h-16'} bg-white/20 rounded-full flex items-center justify-center`}>
        <Icon size={small ? 24 : 32} />
      </div>
    </div>
  </div>
);

export default AdminDashboard;
