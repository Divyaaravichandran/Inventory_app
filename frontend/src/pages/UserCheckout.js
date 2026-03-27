import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { useUserAuth } from '../context/UserAuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiMapPin, FiPhone, FiCreditCard, FiTruck } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const UserCheckout = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: user?.address || '',
    contactPhone: user?.phone || '',
    paymentMethod: 'cash_on_delivery',
    notes: ''
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('userCart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setCart(cartData);
    } else {
      navigate('/user/products');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalAmount, 0);
  };

  const getTotalWeight = () => {
    return cart.reduce((total, item) => total + item.totalQuantityKg, 0);
  };

  const getTotalBags = () => {
    return cart.reduce((total, item) => total + item.quantityBags, 0);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart,
        totalAmount: getCartTotal(),
        shippingAddress: formData.shippingAddress,
        contactPhone: formData.contactPhone,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      await axios.post(`${API_BASE_URL}/api/user/order`, orderData);
      
      // Clear cart
      localStorage.removeItem('userCart');
      setCart([]);
      
      toast.success('Order placed successfully!');
      navigate('/user/orders');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('userCart', JSON.stringify(newCart));
  };

  if (cart.length === 0) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FiShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to your cart to proceed with checkout</p>
            <button
              onClick={() => navigate('/user/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.riceType} - {item.brand}</h4>
                      <p className="text-sm text-gray-600">{item.bagSize} x {item.quantityBags} bags</p>
                      <p className="text-sm text-gray-600">{item.totalQuantityKg} kg @ ₹{item.ratePerKg}/kg</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{item.totalAmount.toLocaleString()}</p>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-sm text-red-600 hover:text-red-700 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Weight:</span>
                  <span className="font-semibold">{getTotalWeight()} kg</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Bags:</span>
                  <span className="font-semibold">{getTotalBags()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary-600">₹{getCartTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiTruck className="mr-2" />
                Shipping Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label">
                    <FiMapPin className="inline mr-2" />
                    Shipping Address *
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your complete shipping address"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <FiPhone className="inline mr-2" />
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your phone number for delivery contact"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <FiCreditCard className="inline mr-2" />
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="label">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Any special instructions for delivery..."
                    rows="2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold">{cart.length} products</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Weight:</span>
                  <span className="font-semibold">{getTotalWeight()} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bags:</span>
                  <span className="font-semibold">{getTotalBags()}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary-600">₹{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Delivery Information</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Standard delivery: 3-5 business days</li>
                  <li>• Free delivery on orders above ₹1000</li>
                  <li>• Order confirmation via SMS/Email</li>
                  <li>• Real-time tracking available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserCheckout;
