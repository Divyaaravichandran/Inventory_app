import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiEye } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/orders`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiCheckCircle />;
      case 'processing': return <FiPackage />;
      case 'shipped': return <FiTruck />;
      case 'delivered': return <FiCheckCircle />;
      case 'cancelled': return <FiXCircle />;
      default: return <FiPackage />;
    }
  };

  const cancelOrder = async (orderId) => {

    try {
      await axios.put(`${API_BASE_URL}/api/user/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
    }
  };

  const deleteOrder = async (orderId) => {
    setDeletingId(orderId);
    try {
      await axios.delete(`https://inventoryapp-7kj0.onrender.com/api/user/orders/${orderId}`);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete order';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const ordersToShow = showAllOrders ? orders : orders.slice(0, 10);

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
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
        {/* Header - Admin style */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
          </div>
        </div>

        {/* Orders Table - Admin Dealers/Orders style */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiPackage className="mr-2 text-primary-600" />
              Order List
            </h2>
            {orders.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAllOrders((v) => !v)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {showAllOrders ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>

          {orders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Items</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersToShow.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 text-sm text-gray-800 font-medium">#{order.orderNumber}</td>
                        <td className="py-2 text-sm text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 text-sm text-gray-800">
                          {order.items?.map((item, i) => (
                            <span key={i}>{item.riceType || item.name} x{item.quantityBags || item.quantity} </span>
                          ))}
                        </td>
                        <td className="py-2 text-sm text-gray-800 text-right">₹{order.totalAmount?.toLocaleString()}</td>
                        <td className="py-2 text-sm text-gray-800">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => viewOrderDetails(order)}
                              className="p-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                            {order.status === 'pending' && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); cancelOrder(order._id); }}
                                className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            )}
                            {(order.status === 'pending' || order.status === 'cancelled') && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); deleteOrder(order._id); }}
                                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                title="Delete"
                                disabled={deletingId === order._id}
                              >
                                {deletingId === order._id ? '...' : 'Delete'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.some(o => o.trackingNumber) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Tracking:</strong> {orders.find(o => o.trackingNumber)?.trackingNumber || '—'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start by browsing our rice products and placing your first order</p>
              <a href="/user/products" className="btn-primary inline-block">
                Browse Products
              </a>
            </div>
          )}
        </div>

        {/* Order Details Modal - Admin card style */}
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Order Details - #{selectedOrder.orderNumber}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Order Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus || 'pending')}`}>
                      {selectedOrder.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-gray-800">{item.riceType || item.name} {item.brand ? `- ${item.brand}` : ''}</h5>
                            <p className="text-sm text-gray-600">{item.bagSize} x {item.quantityBags || item.quantity} bags</p>
                            {(item.totalQuantityKg || item.ratePerKg) && (
                              <p className="text-sm text-gray-600">{item.totalQuantityKg} kg @ ₹{item.ratePerKg}/kg</p>
                            )}
                          </div>
                          <p className="font-semibold text-gray-800">₹{(item.totalAmount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                    <span>Total Amount</span>
                    <span className="text-primary-600">₹{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Delivery Information</h4>
                  <p className="text-sm text-gray-600"><strong>Address:</strong> {selectedOrder.shippingAddress || '—'}</p>
                  <p className="text-sm text-gray-600"><strong>Contact:</strong> {selectedOrder.contactPhone || '—'}</p>
                  {selectedOrder.trackingNumber && (
                    <p className="text-sm text-gray-600"><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserOrders;
