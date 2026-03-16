import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiSave, FiShield } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const AdminSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API_BASE_URL}/api/admin/profile`, formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Settings</h1>

        {/* Profile Update */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FiUser className="mr-2" />
            Update Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={handleChange}
                className="input-field"
                required
              />
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
            </div>
          </form>
        </div>

        {/* System Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FiShield className="mr-2" />
            System Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">Role</p>
                <p className="text-sm text-gray-600">Your current role in the system</p>
              </div>
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold capitalize">
                {user?.role || 'Admin'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">Account Status</p>
                <p className="text-sm text-gray-600">Current account status</p>
              </div>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Industry Profile */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Industry Profile</h2>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-rice-50 to-rice-100 rounded-lg border-2 border-rice-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Kongu Hi-Tech Rice Industries
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive Inventory & Operations Management System
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">System Version</p>
                  <p className="font-semibold text-gray-800">v1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-800">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;
