import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const AdminRecentOrders = () => {
  const [dealerOrders, setDealerOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dealer'); // 'dealer' or 'online'
  const [showAllDealer, setShowAllDealer] = useState(false);
  const [showAllOnline, setShowAllOnline] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDealerOrders();
    fetchUserOrders();
  }, []);

  const fetchDealerOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dealer-orders`);
      setDealerOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to load dealer orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/admin/orders`);
      setUserOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to load online orders');
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/dealer-orders/${orderId}/approve`);
      toast.success('Order approved and inventory updated');
      fetchDealerOrders();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to approve order';
      toast.error(message);
    }
  };

  const handleReject = async (orderId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/dealer-orders/${orderId}/status`, {
        status: 'rejected',
      });
      toast.success('Order rejected');
      fetchDealerOrders();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to reject order';
      toast.error(message);
    }
  };

  const handleDeleteDealerOrder = async (orderId) => {
    setDeletingId(orderId);
    try {
<<<<<<< HEAD
      await axios.delete(`${API_BASE_URL}/api/dealer-orders/${orderId}`);
=======
      await axios.delete(`https://inventoryapp-7kj0.onrender.com/api/dealer-orders/${orderId}`);
>>>>>>> 9eb8d57523f0d370b10ba7ab17c44fa947f77164
      toast.success('Dealer order deleted');
      fetchDealerOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete dealer order';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteUserOrder = async (orderId) => {
    setDeletingId(orderId);
    try {
<<<<<<< HEAD
      await axios.delete(`${API_BASE_URL}/api/user/admin/orders/${orderId}`);
=======
      await axios.delete(`https://inventoryapp-7kj0.onrender.com/api/user/admin/orders/${orderId}`);
>>>>>>> 9eb8d57523f0d370b10ba7ab17c44fa947f77164
      toast.success('Online order deleted');
      fetchUserOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete online order';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const updateUserOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/user/admin/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchUserOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
    }
  };

  const updateUserPaymentStatus = async (orderId, paymentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/user/admin/orders/${orderId}/payment`, { paymentStatus });
      toast.success(`Payment status updated to ${paymentStatus}`);
      fetchUserOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update payment status';
      toast.error(message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved':
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'rejected':
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentOrders =
    activeTab === 'dealer'
      ? (showAllDealer ? dealerOrders : dealerOrders.slice(0, 10))
      : (showAllOnline ? userOrders : userOrders.slice(0, 10));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Recent Orders</h1>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('dealer')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'dealer'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Dealer Orders ({dealerOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'online'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Online Orders ({userOrders.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'dealer' ? 'Dealer Orders' : 'Online Orders'}
              </h2>
              {activeTab === 'dealer' && dealerOrders.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllDealer((v) => !v)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showAllDealer ? 'Show Less' : 'Show More'}
                </button>
              )}
              {activeTab === 'online' && userOrders.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllOnline((v) => !v)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showAllOnline ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
            
            {currentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        {activeTab === 'dealer' ? 'Dealer' : 'Customer'}
                      </th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        Order ID
                      </th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        Items
                      </th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      {activeTab === 'online' && (
                        <>
                          <th className="text-right py-2 text-sm font-semibold text-gray-700">
                            Amount
                          </th>
                          <th className="text-left py-2 text-sm font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="text-left py-2 text-sm font-semibold text-gray-700">
                            Payment
                          </th>
                        </>
                      )}
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 text-sm text-gray-800">
                          {activeTab === 'dealer' ? (
                            order.dealer
                              ? `${order.dealer.dealerName} (${order.dealer.dealerId})`
                              : order.dealerId
                          ) : (
                            order.user
                              ? order.user.name
                              : 'Unknown User'
                          )}
                        </td>
                        <td className="py-2 text-sm text-gray-800 font-medium">
                          {activeTab === 'dealer' ? `D${order._id.slice(-6)}` : order.orderNumber}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {activeTab === 'dealer' ? (
                            `${order.riceType} - ${order.brand}`
                          ) : (
                            order.items?.map((i) => `${i.riceType} - ${i.brand}`).join(', ') || `${order.items?.length || 0} items`
                          )}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {activeTab === 'dealer' ? (
                            `${order.quantityBags || 0} x ${order.bagSize || 'kg'}`
                          ) : (
                            order.items?.map((i) => `${i.quantityBags || 0}x${i.bagSize || ''}`).join(', ') || '-'
                          )}
                        </td>
                        {activeTab === 'online' && (
                          <>
                            <td className="py-2 text-sm text-gray-800 text-right font-semibold">
                              ?{order.totalAmount?.toLocaleString() || 0}
                            </td>
                            <td className="py-2 text-sm text-gray-800">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-2 text-sm text-gray-800">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="py-2 text-sm text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {activeTab === 'dealer' ? (
                            order.status === 'pending' ? (
                              <div className="flex items-center gap-2 flex-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(order._id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(order._id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
                                >
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDealerOrder(order._id)}
                                  disabled={deletingId === order._id}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300"
                                >
                                  {deletingId === order._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {order.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDealerOrder(order._id)}
                                  disabled={deletingId === order._id}
                                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                                >
                                  {deletingId === order._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2 flex-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => updateUserOrderStatus(order._id, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded min-w-max"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <select
                                value={order.paymentStatus}
                                onChange={(e) => updateUserPaymentStatus(order._id, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded min-w-max"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="failed">Failed</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteUserOrder(order._id)}
                                disabled={deletingId === order._id}
                                className="px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-700"
                              >
                                {deletingId === order._id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No {activeTab === 'dealer' ? 'dealer' : 'online'} orders found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminRecentOrders;


