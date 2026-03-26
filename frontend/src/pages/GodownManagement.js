import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { FiPlus, FiMapPin, FiPackage, FiX } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';
=======
import { FiPlus, FiMapPin, FiPackage, FiTrash2, FiX, FiEdit2 } from 'react-icons/fi';

>>>>>>> ebaf816 (Modified some pages)

const GodownManagement = () => {
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGodown, setSelectedGodown] = useState(null);
  const [godownDetails, setGodownDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    stockType: 'mixed',
  });

  useEffect(() => {
    fetchGodowns();
  }, []);

  const fetchGodowns = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/godown`);
      setGodowns(response.data);
    } catch (error) {
      toast.error('Failed to load godowns');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
<<<<<<< HEAD
      await axios.post(`${API_BASE_URL}/api/godown`, {
        ...formData,
        capacity: parseFloat(formData.capacity),
      });
      toast.success('Godown added successfully!');
=======
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/godown/${editingId}`, {
          ...formData,
          capacity: parseFloat(formData.capacity),
        });
        toast.success('Godown updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/godown', {
          ...formData,
          capacity: parseFloat(formData.capacity),
        });
        toast.success('Godown added successfully!');
      }
>>>>>>> ebaf816 (Modified some pages)
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({ name: '', location: '', capacity: '', stockType: 'mixed' });
      fetchGodowns();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} godown`;
      toast.error(message);
    }
  };

  const getCapacityPercent = (godown) => {
    return (godown.currentStock / godown.capacity) * 100;
  };

  const getCapacityColor = (percent) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const handleEdit = (godown, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingId(godown._id);
    setFormData({
      name: godown.name,
      location: godown.location,
      capacity: godown.capacity,
      stockType: godown.stockType,
    });
    setShowForm(true);
  };

  const handleGodownClick = async (godown) => {
    setSelectedGodown(godown);
    setDetailsLoading(true);
    setGodownDetails(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/godown/${godown._id}/details`);
      setGodownDetails(res.data);
    } catch (error) {
      toast.error('Failed to load godown details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteGodown = async (godown, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/api/godown/${godown._id}`);
      toast.success('Godown deleted');
      if (selectedGodown?._id === godown._id) {
        closeGodownDetails();
      }
      fetchGodowns();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete godown';
      toast.error(message);
    }
  };

  const handleDeletePaddy = async (paddyId) => {
    try {
      await axios.delete(`http://localhost:5000/api/paddy/${paddyId}`);
      toast.success('Paddy stock deleted');
      if (selectedGodown) {
        handleGodownClick(selectedGodown);
        fetchGodowns();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete paddy stock';
      toast.error(message);
    }
  };

  const handleDeleteRice = async (riceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/rice/${riceId}`);
      toast.success('Rice stock deleted');
      if (selectedGodown) {
        handleGodownClick(selectedGodown);
        fetchGodowns();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete rice stock';
      toast.error(message);
    }
  };

  const closeGodownDetails = () => {
    setSelectedGodown(null);
    setGodownDetails(null);
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
          <h1 className="text-3xl font-bold text-gray-800">Godown Management</h1>
          <button onClick={() => {
            setShowForm(!showForm);
            if (!showForm && isEditing) {
              setIsEditing(false);
              setEditingId(null);
              setFormData({ name: '', location: '', capacity: '', stockType: 'mixed' });
            }
          }} className="btn-primary flex items-center space-x-2">
            <FiPlus />
            <span>Add Godown</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Godown' : 'Add New Godown'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Godown Name *</label>
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
                <label className="label">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Capacity (tons) *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input-field"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Stock Type *</label>
                <select
                  name="stockType"
                  value={formData.stockType}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="paddy">Paddy</option>
                  <option value="rice">Rice</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Godown' : 'Add Godown'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setFormData({ name: '', location: '', capacity: '', stockType: 'mixed' });
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
          {godowns.map((godown) => {
            const capacityPercent = getCapacityPercent(godown);
            const isNearFull = capacityPercent >= 90;

            return (
              <div
                key={godown._id}
                onClick={() => handleGodownClick(godown)}
                className={`card transform hover:scale-105 transition-all cursor-pointer ${
                  isNearFull ? 'ring-2 ring-amber-500 shadow-lg' : ''
                } ${selectedGodown?._id === godown._id ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{godown.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiMapPin className="mr-1" />
                      {godown.location}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold capitalize">
                      {godown.stockType}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleEdit(godown, e)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                      title="Edit godown"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteGodown(godown, e)}
                      className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                      title="Delete godown"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Capacity</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {capacityPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getCapacityColor(
                        capacityPercent
                      )}`}
                      style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-gray-600">
                    <FiPackage className="mr-2" />
                    <span className="text-sm">
                      {godown.currentStock.toFixed(2)} / {godown.capacity.toFixed(2)} tons
                    </span>
                  </div>
                  {isNearFull && (
                    <span className="text-xs font-semibold text-amber-600">Near Full!</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {godowns.length === 0 && (
          <div className="card text-center py-12">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No godowns found. Add your first godown to get started.</p>
          </div>
        )}

        {/* Godown Stock Modal */}
        {selectedGodown && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeGodownDetails}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedGodown.name} - Stock Details
                </h3>
                <button onClick={closeGodownDetails} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                {detailsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                  </div>
                ) : godownDetails ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Paddy Stock</h4>
                      {godownDetails.paddyStock && godownDetails.paddyStock.length > 0 ? (
                        <div className="space-y-2">
                          {godownDetails.paddyStock.map((p) => (
                            <div key={p._id} className="p-3 bg-amber-50 rounded-lg flex justify-between items-center">
                              <span className="font-medium text-gray-800">{p.paddyType}</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">
                                  {p.quantity?.toLocaleString()} qty | {p.weight?.toLocaleString()} tons | {p.qualityGrade}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePaddy(p._id)}
                                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No paddy stock</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Rice Stock</h4>
                      {godownDetails.riceStock && godownDetails.riceStock.length > 0 ? (
                        <div className="space-y-2">
                          {godownDetails.riceStock.map((r) => (
                            <div key={r._id} className="p-3 bg-green-50 rounded-lg flex justify-between items-center">
                              <span className="font-medium text-gray-800">{r.riceType} - {r.riceName}</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">
                                  {r.quantity?.toLocaleString()} kg | 5kg:{r.bagsStock?.['5kg'] || 0} | 10kg:{r.bagsStock?.['10kg'] || 0} | 25kg:{r.bagsStock?.['25kg'] || 0} | 75kg:{r.bagsStock?.['75kg'] || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRice(r._id)}
                                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No rice stock</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GodownManagement;
