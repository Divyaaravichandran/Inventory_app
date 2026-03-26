import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { FiPlus, FiEdit2, FiToggleLeft, FiUser } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';
=======
import { FiPlus, FiEdit2, FiToggleLeft, FiTrash2, FiUser } from 'react-icons/fi';
>>>>>>> ebaf816 (Modified some pages)

const AdminDealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [overview, setOverview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dealerName: '',
    businessName: '',
    contactNumber: '',
    location: '',
    gstNumber: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dealers`);
      setDealers(res.data);
    } catch (error) {
      toast.error('Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async (dealerId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/dealers/${dealerId}/overview`
      );
      setOverview(res.data);
    } catch (error) {
      toast.error('Failed to load dealer details');
    }
  };

  const validateContact = (contact) => {
    const digitsOnly = (contact || '').replace(/\D/g, '');
    if (digitsOnly.length === 0) return { valid: false, message: 'Contact number is required' };
    if (digitsOnly.length !== 10) return { valid: false, message: 'Enter a valid 10-digit mobile number' };
    return { valid: true, message: '' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.dealerName?.trim()) errors.dealerName = 'Dealer name is required';
    else if (formData.dealerName.trim().length < 2) errors.dealerName = 'Dealer name must be at least 2 characters';
    if (!formData.businessName?.trim()) errors.businessName = 'Business name is required';
    const contactVal = validateContact(formData.contactNumber);
    if (!contactVal.valid) errors.contactNumber = contactVal.message;
    if (!formData.location?.trim()) errors.location = 'Location is required';
    if (formData.gstNumber?.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d][A-Z]\d{4}$/.test(formData.gstNumber)) {
      errors.gstNumber = 'Invalid GST format (e.g. 22AAAAA0000A1Z5)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (selectedDealer) {
        await axios.put(
          `${API_BASE_URL}/api/dealers/${selectedDealer._id}`,
          formData
        );
        toast.success('Dealer updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/dealers`, formData);
        toast.success('Dealer added successfully');
      }
      setShowForm(false);
      setSelectedDealer(null);
      setFormErrors({});
      setFormData({
        dealerName: '',
        businessName: '',
        contactNumber: '',
        location: '',
        gstNumber: '',
        status: 'active',
      });
      fetchDealers();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to save dealer';
      toast.error(message);
    }
  };

  const handleEdit = (dealer) => {
    setSelectedDealer(dealer);
    setFormData({
      dealerName: dealer.dealerName,
      businessName: dealer.businessName,
      contactNumber: dealer.contactNumber,
      location: dealer.location,
      gstNumber: dealer.gstNumber || '',
      status: dealer.status,
    });
    setShowForm(true);
    setOverview(null);
  };

  const handleDisable = async (dealer) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/dealers/${dealer._id}/disable`
      );
      toast.success('Dealer disabled');
      fetchDealers();
    } catch (error) {
      toast.error('Failed to disable dealer');
    }
  };

  const handleDelete = async (dealer) => {
    if (!window.confirm(`Are you sure you want to permanently delete dealer ${dealer.dealerName}?`)) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/dealers/${dealer._id}`
      );
      toast.success('Dealer permanently deleted');
      fetchDealers();
    } catch (error) {
      toast.error('Failed to delete dealer');
    }
  };

  const handleSelectDealer = (dealer) => {
    setSelectedDealer(dealer);
    fetchOverview(dealer._id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Dealers</h1>
          <button
            onClick={() => {
              setSelectedDealer(null);
              setFormData({
                dealerName: '',
                businessName: '',
                contactNumber: '',
                location: '',
                gstNumber: '',
                status: 'active',
              });
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus />
            <span>Add Dealer</span>
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedDealer ? 'Edit Dealer' : 'Add Dealer'}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="label">Dealer Name *</label>
                <input
                  type="text"
                  name="dealerName"
                  value={formData.dealerName}
                  onChange={handleChange}
                  className={`input-field ${formErrors.dealerName ? 'border-red-500' : ''}`}
                  placeholder="Enter dealer name"
                  required
                />
                {formErrors.dealerName && <p className="mt-1 text-sm text-red-600">{formErrors.dealerName}</p>}
              </div>
              <div>
                <label className="label">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`input-field ${formErrors.businessName ? 'border-red-500' : ''}`}
                  placeholder="Enter business name"
                  required
                />
                {formErrors.businessName && <p className="mt-1 text-sm text-red-600">{formErrors.businessName}</p>}
              </div>
              <div>
                <label className="label">Contact Number *</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`input-field ${formErrors.contactNumber ? 'border-red-500' : ''}`}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  required
                />
                {formErrors.contactNumber && <p className="mt-1 text-sm text-red-600">{formErrors.contactNumber}</p>}
              </div>
              <div>
                <label className="label">Location / Delivery Area *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`input-field ${formErrors.location ? 'border-red-500' : ''}`}
                  placeholder="Enter location/delivery area"
                  required
                />
                {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
              </div>
              <div>
                <label className="label">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className={`input-field ${formErrors.gstNumber ? 'border-red-500' : ''}`}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                />
                {formErrors.gstNumber && <p className="mt-1 text-sm text-red-600">{formErrors.gstNumber}</p>}
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-3 flex space-x-4 pt-2">
                <button type="submit" className="btn-primary">
                  {selectedDealer ? 'Update Dealer' : 'Add Dealer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dealers table */}
          <div className="lg:col-span-2 card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Dealer List
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Dealer
                    </th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Area
                    </th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.length > 0 ? (
                    dealers.map((dealer) => (
                      <tr
                        key={dealer._id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectDealer(dealer)}
                      >
                        <td className="py-2 text-sm text-gray-800">
                          <div className="flex items-center space-x-2">
                            <FiUser className="text-gray-400" />
                            <div>
                              <div className="font-semibold">
                                {dealer.dealerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {dealer.dealerId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {dealer.contactNumber}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {dealer.location}
                        </td>
                        <td className="py-2 text-sm text-gray-800 capitalize">
                          {dealer.status}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(dealer);
                              }}
                              className="p-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            {dealer.status === 'active' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDisable(dealer);
                                }}
                                className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200"
                              >
                                <FiToggleLeft size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(dealer);
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500 text-sm"
                      >
                        No dealers added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dealer overview */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Dealer Overview
            </h2>
            {overview && overview.dealer ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Dealer</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {overview.dealer.dealerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {overview.dealer.dealerId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Recent Orders</p>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {overview.orders && overview.orders.length > 0 ? (
                      overview.orders.map((order) => (
                        <div
                          key={order._id}
                          className="p-2 bg-gray-50 rounded-lg text-xs text-gray-700"
                        >
                          {order.riceType} - {order.brand} |{' '}
                          {order.quantityBags} x {order.bagSize} |{' '}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No orders yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Recent Invoices</p>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {overview.invoices && overview.invoices.length > 0 ? (
                      overview.invoices.map((inv) => (
                        <div
                          key={inv._id}
                          className="p-2 bg-gray-50 rounded-lg text-xs text-gray-700"
                        >
                          {inv.invoiceNumber} - ₹{inv.amount?.toLocaleString()} |{' '}
                          <span className="capitalize">
                            {inv.paymentStatus}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No invoices yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Select a dealer from the list to view their history.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDealers;

