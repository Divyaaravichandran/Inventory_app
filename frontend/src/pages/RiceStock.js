import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiBox, FiPlus } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const RiceStock = () => {
  const [riceStock, setRiceStock] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    riceName: '',
    riceType: '',
    quantity: '',
    ratePerKg: '',
    godownId: '',
    bagsStock: {
      '5kg': '',
      '10kg': '',
      '25kg': '',
      '75kg': '',
    },
  });

  useEffect(() => {
    fetchRiceStock();
    fetchGodowns();
  }, []);

  const fetchRiceStock = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rice`);
      setRiceStock(response.data);
    } catch (error) {
      toast.error('Failed to load rice stock');
    } finally {
      setLoading(false);
    }
  };

  const fetchGodowns = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/godown`);
      setGodowns(response.data);
    } catch (error) {
      console.error('Failed to load godowns');
    }
  };

  const handleChange = (e) => {
    if (e.target.name.startsWith('bagsStock.')) {
      const bagSize = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        bagsStock: {
          ...formData.bagsStock,
          [bagSize]: e.target.value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        ratePerKg: parseFloat(formData.ratePerKg) || 0,
        bagsStock: {
          '5kg': parseFloat(formData.bagsStock['5kg']) || 0,
          '10kg': parseFloat(formData.bagsStock['10kg']) || 0,
          '25kg': parseFloat(formData.bagsStock['25kg']) || 0,
          '75kg': parseFloat(formData.bagsStock['75kg']) || 0,
        },
      };
      const totalBagsKg =
        payload.bagsStock['5kg'] * 5 +
        payload.bagsStock['10kg'] * 10 +
        payload.bagsStock['25kg'] * 25 +
        payload.bagsStock['75kg'] * 75;
      if ((payload.quantity || 0) <= 0) {
        toast.error('Please enter available quantity');
        return;
      }
      if (totalBagsKg > payload.quantity) {
        toast.error('Bag stock exceeds available quantity');
        return;
      }

      if (isEditing && editingId) {
        await axios.put(`${API_BASE_URL}/api/rice/${editingId}`, payload);
        toast.success('Rice stock updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/rice`, payload);
        toast.success('Rice stock added successfully!');
      }
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        riceName: '',
        riceType: '',
        quantity: '',
        ratePerKg: '',
        godownId: '',
        bagsStock: { '5kg': '', '10kg': '', '25kg': '', '75kg': '' },
      });
      fetchRiceStock();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (isEditing ? 'Failed to update rice stock' : 'Failed to add rice stock');
      toast.error(message);
    }
  };

  const getBagsTotalKg = () => {
    const b = formData.bagsStock || {};
    return (
      (parseFloat(b['5kg']) || 0) * 5 +
      (parseFloat(b['10kg']) || 0) * 10 +
      (parseFloat(b['25kg']) || 0) * 25 +
      (parseFloat(b['75kg']) || 0) * 75
    );
  };

  const handleEdit = (rice) => {
    setShowForm(true);
    setIsEditing(true);
    setEditingId(rice._id);
    setFormData({
      riceName: rice.riceName || '',
      riceType: rice.riceType || '',
      quantity: rice.quantity ?? '',
      ratePerKg: rice.ratePerKg ?? '',
      godownId: rice.godownId?._id || '',
      bagsStock: {
        '5kg': rice.bagsStock?.['5kg'] ?? '',
        '10kg': rice.bagsStock?.['10kg'] ?? '',
        '25kg': rice.bagsStock?.['25kg'] ?? '',
        '75kg': rice.bagsStock?.['75kg'] ?? '',
      },
    });
  };

  const handleDelete = async (rice) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/rice/${rice._id}`);
      toast.success('Rice stock deleted');
      fetchRiceStock();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete rice stock';
      toast.error(message);
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Rice Stock</h1>
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setIsEditing(false);
                setEditingId(null);
              } else {
                setShowForm(true);
                setIsEditing(false);
                setEditingId(null);
                setFormData({
                  riceName: '',
                  riceType: '',
                  quantity: '',
                  ratePerKg: '',
                  godownId: '',
                  bagsStock: { '5kg': '', '10kg': '', '25kg': '', '75kg': '' },
                });
              }
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus />
            <span>{showForm ? 'Close Form' : 'Add Rice Stock'}</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isEditing ? 'Edit Rice Stock' : 'Add Rice Stock'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Rice Name *</label>
                  <input
                    type="text"
                    name="riceName"
                    value={formData.riceName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Premium Basmati"
                    required
                  />
                </div>
                <div>
                  <label className="label">Rice Type *</label>
                  <select
                    name="riceType"
                    value={formData.riceType}
                    onChange={handleChange}
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
                  <label className="label">Quantity (kg) *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="input-field"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="label">Rate (₹/kg) *</label>
                  <input
                    type="number"
                    name="ratePerKg"
                    value={formData.ratePerKg}
                    onChange={handleChange}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="label">Godown *</label>
                  <select
                    name="godownId"
                    value={formData.godownId}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Godown</option>
                    {godowns.map((godown) => (
                      <option key={godown._id} value={godown._id}>
                        {godown.name} - {godown.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label mb-3">Bag Stock</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['5kg', '10kg', '25kg', '75kg'].map((size) => (
                    <div key={size}>
                      <label className="text-sm text-gray-600">{size} Bags</label>
                      <input
                        type="number"
                        name={`bagsStock.${size}`}
                        value={formData.bagsStock[size]}
                        onChange={handleChange}
                        className="input-field"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
                  <span>Bags Total</span>
                  <span className="font-semibold text-gray-800">
                    {getBagsTotalKg().toLocaleString()} kg
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Remaining: {Math.max(0, (parseFloat(formData.quantity) || 0) - getBagsTotalKg()).toLocaleString()} kg
                </div>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Stock' : 'Add Stock'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riceStock.map((rice) => (
            <div
              key={rice._id}
              className={`card transform hover:scale-105 transition-all border ${
                (Number(rice.quantity) || 0) < 50
                  ? 'border-red-200'
                  : (Number(rice.quantity) || 0) >= 50 && (Number(rice.quantity) || 0) <= 100
                  ? 'border-amber-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{rice.riceName}</h3>
                  <p className="text-sm text-gray-600 capitalize">{rice.riceType}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold capitalize">
                    {rice.status}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(rice)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rice)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Quantity</span>
                  <span className="text-lg font-bold text-gray-800">{rice.quantity} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rate (₹/kg)</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ₹{Number(rice.ratePerKg || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                {rice.godownId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Godown</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {rice.godownId.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">5kg:</span>{' '}
                    <span className="font-semibold">{rice.bagsStock?.['5kg'] || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">10kg:</span>{' '}
                    <span className="font-semibold">{rice.bagsStock?.['10kg'] || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">25kg:</span>{' '}
                    <span className="font-semibold">{rice.bagsStock?.['25kg'] || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">75kg:</span>{' '}
                    <span className="font-semibold">{rice.bagsStock?.['75kg'] || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {riceStock.length === 0 && (
          <div className="card text-center py-12">
            <FiBox className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No rice stock found. Add rice stock to get started.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RiceStock;
