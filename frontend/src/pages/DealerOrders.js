import React, { useEffect, useState } from 'react';
import DealerLayout from '../components/DealerLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const DealerOrders = () => {
  const [orderItems, setOrderItems] = useState([
    {
      riceType: '',
      brand: '',
      bagSize: '',
      quantityBags: '',
      ratePerKg: '',
    },
  ]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dealer-orders/dealer`);
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setOrderItems(updatedItems);
  };

  const addMoreItem = () => {
    setOrderItems([
      ...orderItems,
      {
        riceType: '',
        brand: '',
        bagSize: '',
        quantityBags: '',
        ratePerKg: '',
      },
    ]);
  };

  const removeItem = (index) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
    } else {
      toast.error('At least one item is required');
    }
  };

  const calculateItemTotal = (item) => {
    const bagWeights = { '5kg': 5, '10kg': 10, '25kg': 25, '75kg': 75 };
    const weightPerBag = bagWeights[item.bagSize] || 0;
    const quantity = parseInt(item.quantityBags) || 0;
    const rate = parseFloat(item.ratePerKg) || 0;
    return weightPerBag * quantity * rate;
  };

  const calculateTotalAmount = () => {
    return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all items
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.riceType || !item.brand || !item.bagSize || !item.quantityBags) {
        toast.error(`Please fill all fields for item ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      // Submit each item as a separate order (or combine into one order if backend supports it)
      const orderPromises = orderItems.map((item) =>
        axios.post(`${API_BASE_URL}/api/dealer-orders/dealer`, {
          riceType: item.riceType,
          brand: item.brand,
          bagSize: item.bagSize,
          quantityBags: parseInt(item.quantityBags, 10),
          ratePerKg: item.ratePerKg ? parseFloat(item.ratePerKg) : undefined,
        })
      );

      await Promise.all(orderPromises);
      toast.success(`${orderItems.length} order(s) placed successfully. Pending admin approval.`);
      setOrderItems([
        {
          riceType: '',
          brand: '',
          bagSize: '',
          quantityBags: '',
          ratePerKg: '',
        },
      ]);
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setDeletingId(orderId);
    try {
      await axios.delete(`https://inventoryapp-7kj0.onrender.com/api/dealer-orders/dealer/${orderId}`);
      toast.success('Order deleted');
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete order';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const ordersToShow = showAllHistory ? orders : orders.slice(0, 5);

  return (
    <DealerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
        <p className="text-gray-600 mb-6">
          Place new rice orders and track their status.
        </p>

        {/* Order form */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Place New Order
            </h2>
            <button
              type="button"
              onClick={addMoreItem}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <FiPlus />
              <span>Add More Item</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {orderItems.map((item, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Item {index + 1}</h3>
                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <FiTrash2 size={16} />
                      <span className="text-sm">Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="label">Rice Type *</label>
                    <select
                      value={item.riceType}
                      onChange={(e) => handleItemChange(index, 'riceType', e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Basmati">Basmati</option>
                      <option value="Sona Masoori">Sona Masoori</option>
                      <option value="Jasmine">Jasmine</option>
                      <option value="Brown Rice">Brown Rice</option>
                      <option value="Parboiled">Parboiled</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Brand *</label>
                    <input
                      type="text"
                      value={item.brand}
                      onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                      className="input-field"
                      placeholder="Brand name"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Bag Size *</label>
                    <select
                      value={item.bagSize}
                      onChange={(e) => handleItemChange(index, 'bagSize', e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select Size</option>
                      <option value="5kg">5 kg</option>
                      <option value="10kg">10 kg</option>
                      <option value="25kg">25 kg</option>
                      <option value="75kg">75 kg</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Quantity (bags) *</label>
                    <input
                      type="number"
                      value={item.quantityBags}
                      onChange={(e) => handleItemChange(index, 'quantityBags', e.target.value)}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Rate (?/kg)</label>
                    <input
                      type="number"
                      value={item.ratePerKg}
                      onChange={(e) => handleItemChange(index, 'ratePerKg', e.target.value)}
                      className="input-field"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Item Total */}
                {item.bagSize && item.quantityBags && (
                  <div className="mt-3 text-right">
                    <span className="text-sm text-gray-600">Item Total: </span>
                    <span className="font-bold text-primary-600">
                      ?{calculateItemTotal(item).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Grand Total */}
            {orderItems.some((item) => item.bagSize && item.quantityBags) && (
              <div className="border-t-2 border-primary-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ?{calculateTotalAmount().toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Placing order...' : `Place ${orderItems.length} Order(s)`}
              </button>
            </div>
          </form>
        </div>

        {/* Orders table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Order History</h2>
            {orders.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllHistory((v) => !v)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {showAllHistory ? 'Show Less' : 'Show More'}
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
                  <th className="text-left py-2 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                                  </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  ordersToShow.map((order) => (
                    <tr key={order._id} className="border-b">
                      <td className="py-2 text-sm text-gray-800">
                        {order.riceType} - {order.brand}
                      </td>
                      <td className="py-2 text-sm text-gray-800">
                        {order.quantityBags} x {order.bagSize}
                      </td>
                      <td className="py-2 text-sm text-gray-800">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {order.status}
                          </span>
                          {order.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order._id)}
                              disabled={deletingId === order._id}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              {deletingId === order._id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-sm text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-4 text-center text-gray-500 text-sm"
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DealerLayout>
  );
};

export default DealerOrders;


