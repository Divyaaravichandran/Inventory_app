// frontend/src/pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { useUserAuth } from '../context/UserAuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiShield } from 'react-icons/fi';

const UserProfile = () => {
  const { user, updateProfile } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: formData.address
    });

    if (result.success) {
      setEditing(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    setEditing(false);
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>

        {/* Profile Update - Admin Settings style */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FiUser className="mr-2 text-primary-600" />
            {editing ? 'Update Profile' : 'Personal Information'}
          </h2>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <FiMail className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="input-field bg-gray-50"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="label">
                    <FiPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1234567890"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">
                    <FiMapPin className="inline mr-2" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="123 Main St, City, State"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiSave />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-800">{user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="font-semibold text-gray-800">{user?.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-800">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-gray-800">{user?.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiEdit2 />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Quick Actions - Admin style cards */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/user/orders'}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
            >
              <h4 className="font-bold text-gray-800 mb-1">View Orders</h4>
              <p className="text-sm text-gray-600">Check your order history</p>
            </button>
            <button
              onClick={() => window.location.href = '/user/products'}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
            >
              <h4 className="font-bold text-gray-800 mb-1">Browse Products</h4>
              <p className="text-sm text-gray-600">Shop for rice products</p>
            </button>
            <button
              onClick={() => window.location.href = '/user/dashboard'}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
            >
              <h4 className="font-bold text-gray-800 mb-1">Dashboard</h4>
              <p className="text-sm text-gray-600">View account overview</p>
            </button>
          </div>
        </div>

        {/* Security Section - Admin Settings style */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FiShield className="mr-2 text-primary-600" />
            Security Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">Password</p>
                <p className="text-sm text-gray-600">Update your password</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 font-semibold">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;
