import React, { useEffect, useState } from 'react';
import DealerLayout from '../components/DealerLayout';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const DealerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchOrders();
    fetchInvoices();
  }, []);

  const ordersToShow = showAllOrders ? recentOrders : recentOrders.slice(0, 5);
  const invoicesToShow = showAllInvoices ? recentInvoices : recentInvoices.slice(0, 5);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/dealer-orders/dealer/analytics`
      );
      setAnalytics(res.data);
    } catch (error) {
      // silent fail, toast handled in context if needed
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dealer-orders/dealer`);
      setRecentOrders(res.data || []);
    } catch (error) {
      // silent
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/invoices/dealer`);
      setRecentInvoices(res.data || []);
    } catch (error) {
      // silent
    }
  };


  return (
    <DealerLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold">Dealer Dashboard</h1>
          <p className="text-sm text-primary-100">
            Track your orders, invoices, and purchase trends at a glance.
          </p>
        </div>

        {/* Analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard
            title="Total Quantity Purchased"
            value={
              analytics
                ? `${(analytics.totalQuantity || 0).toFixed(2)} kg`
                : '0 kg'
            }
          />
          <AnalyticsCard
            title="Most Purchased Rice"
            value={analytics?.mostPurchasedRiceType || '-'}
          />
          <AnalyticsCard
            title="Last Order Date"
            value={
              analytics?.lastOrderDate
                ? new Date(analytics.lastOrderDate).toLocaleDateString()
                : '-'
            }
          />
        </div>

        {/* Recent orders & invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
              {recentOrders.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllOrders((v) => !v)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showAllOrders ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Rice
                    </th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Bags
                    </th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    
                  </tr>
                </thead>
                <tbody>
                  {ordersToShow.length > 0 ? (
                    ordersToShow.map((order) => (
                      <tr key={order._id} className="border-b">
                        <td className="py-2 text-sm text-gray-800">
                          {order.riceType} - {order.brand}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {order.quantityBags} x {order.bagSize}
                        </td>
                        <td className="py-2 text-sm text-gray-800 capitalize">
                          {order.status}
                        </td>
                        
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-gray-500 text-sm">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Invoices</h3>
              {recentInvoices.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllInvoices((v) => !v)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showAllInvoices ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Invoice</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Status</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {invoicesToShow.length > 0 ? (
                    invoicesToShow.map((inv) => (
                      <tr key={inv._id} className="border-b">
                        <td className="py-2 text-sm text-gray-800">{inv.invoiceNumber}</td>
                        <td className="py-2 text-sm text-gray-800">₹{inv.amount?.toLocaleString()}</td>
                        <td className="py-2 text-sm text-gray-800 capitalize">{inv.paymentStatus}</td>
                        
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-gray-500 text-sm">No invoices yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DealerLayout>
  );
};

const AnalyticsCard = ({ title, value }) => (
  <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
    <p className="text-sm opacity-90 mb-1">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default DealerDashboard;
