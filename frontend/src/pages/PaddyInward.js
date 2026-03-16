import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiCheck } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const PaddyInward = () => {
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    paddyType: '',
    quantity: '',
    weight: '',
    qualityGrade: '',
    moisturePercent: '',
    sellerName: '',
    sellerContact: '',
    vehicleNumber: '',
    location: '',
    godownId: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchGodowns();
  }, []);

  const fetchGodowns = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/godown`);
      setGodowns(response.data);
    } catch (error) {
      toast.error('Failed to load godowns');
    }
  };

  const validateContact = (contact) => {
    const digitsOnly = (contact || '').replace(/\D/g, '');
    if (digitsOnly.length === 0) return { valid: false, message: 'Seller contact is required' };
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
    if (!formData.paddyType) errors.paddyType = 'Paddy type is required';
    const qty = parseFloat(formData.quantity);
    if (!formData.quantity || isNaN(qty) || qty <= 0) errors.quantity = 'Enter a valid quantity greater than 0';
    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || weight <= 0) errors.weight = 'Enter a valid weight greater than 0';
    if (!formData.qualityGrade) errors.qualityGrade = 'Quality grade is required';
    const moist = parseFloat(formData.moisturePercent);
    if (formData.moisturePercent === '' || isNaN(moist) || moist < 0 || moist > 100) {
      errors.moisturePercent = 'Enter moisture % between 0 and 100';
    }
    if (!formData.sellerName?.trim()) errors.sellerName = 'Seller name is required';
    const contactVal = validateContact(formData.sellerContact);
    if (!contactVal.valid) errors.sellerContact = contactVal.message;
    if (!formData.vehicleNumber?.trim()) errors.vehicleNumber = 'Vehicle number is required';
    if (!formData.location?.trim()) errors.location = 'Location is required';
    if (!formData.godownId) errors.godownId = 'Godown is required';
    if (!formData.date) errors.date = 'Date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/paddy`, {
        ...formData,
        quantity: parseFloat(formData.quantity),
        weight: parseFloat(formData.weight),
        moisturePercent: parseFloat(formData.moisturePercent),
      });
      toast.success('Paddy inward added successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          paddyType: '',
          quantity: '',
          weight: '',
          qualityGrade: '',
          moisturePercent: '',
          sellerName: '',
          sellerContact: '',
          vehicleNumber: '',
          location: '',
          godownId: '',
          date: new Date().toISOString().split('T')[0],
        });
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add paddy inward';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Paddy Inward (Procurement)</h1>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <FiCheck className="text-green-600 mr-2" size={20} />
            <span className="text-green-800 font-medium">Paddy inward added successfully!</span>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Paddy Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Paddy Details</h3>

                <div>
                  <label className="label">Paddy Type *</label>
                  <select
                    name="paddyType"
                    value={formData.paddyType}
                    onChange={handleChange}
                    className={`input-field ${formErrors.paddyType ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Paddy Type</option>
                    <option value="Basmati">Basmati</option>
                    <option value="Sona Masoori">Sona Masoori</option>
                    <option value="Jasmine">Jasmine</option>
                    <option value="Brown Rice">Brown Rice</option>
                    <option value="Parboiled">Parboiled</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.paddyType && <p className="mt-1 text-sm text-red-600">{formErrors.paddyType}</p>}
                </div>

                <div>
                  <label className="label">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`input-field ${formErrors.quantity ? 'border-red-500' : ''}`}
                    placeholder="Enter quantity"
                    step="0.01"
                    required
                  />
                  {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
                </div>

                <div>
                  <label className="label">Weight (tons) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className={`input-field ${formErrors.weight ? 'border-red-500' : ''}`}
                    placeholder="Enter weight in tons"
                    step="0.01"
                    required
                  />
                  {formErrors.weight && <p className="mt-1 text-sm text-red-600">{formErrors.weight}</p>}
                </div>

                <div>
                  <label className="label">Quality Grade *</label>
                  <select
                    name="qualityGrade"
                    value={formData.qualityGrade}
                    onChange={handleChange}
                    className={`input-field ${formErrors.qualityGrade ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                  {formErrors.qualityGrade && <p className="mt-1 text-sm text-red-600">{formErrors.qualityGrade}</p>}
                </div>

                <div>
                  <label className="label">Moisture % *</label>
                  <input
                    type="number"
                    name="moisturePercent"
                    value={formData.moisturePercent}
                    onChange={handleChange}
                    className={`input-field ${formErrors.moisturePercent ? 'border-red-500' : ''}`}
                    placeholder="Enter moisture percentage (0-100)"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                  {formErrors.moisturePercent && <p className="mt-1 text-sm text-red-600">{formErrors.moisturePercent}</p>}
                </div>
              </div>

              {/* Right Column: Seller & Logistics */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Seller & Logistics</h3>

                <div>
                  <label className="label">Seller Name *</label>
                  <input
                    type="text"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    className={`input-field ${formErrors.sellerName ? 'border-red-500' : ''}`}
                    placeholder="Enter seller name"
                    required
                  />
                  {formErrors.sellerName && <p className="mt-1 text-sm text-red-600">{formErrors.sellerName}</p>}
                </div>

                <div>
                  <label className="label">Seller Contact *</label>
                  <input
                    type="text"
                    name="sellerContact"
                    value={formData.sellerContact}
                    onChange={handleChange}
                    className={`input-field ${formErrors.sellerContact ? 'border-red-500' : ''}`}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                  {formErrors.sellerContact && <p className="mt-1 text-sm text-red-600">{formErrors.sellerContact}</p>}
                </div>

                <div>
                  <label className="label">Vehicle Number *</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className={`input-field ${formErrors.vehicleNumber ? 'border-red-500' : ''}`}
                    placeholder="Enter vehicle number"
                    required
                  />
                  {formErrors.vehicleNumber && <p className="mt-1 text-sm text-red-600">{formErrors.vehicleNumber}</p>}
                </div>

                <div>
                  <label className="label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`input-field ${formErrors.location ? 'border-red-500' : ''}`}
                    placeholder="Enter location"
                    required
                  />
                  {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
                </div>

                <div>
                  <label className="label">Godown *</label>
                  <select
                    name="godownId"
                    value={formData.godownId}
                    onChange={handleChange}
                    className={`input-field ${formErrors.godownId ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Godown</option>
                    {godowns.map((godown) => (
                      <option key={godown._id} value={godown._id}>
                        {godown.name} - {godown.location}
                      </option>
                    ))}
                  </select>
                  {formErrors.godownId && <p className="mt-1 text-sm text-red-600">{formErrors.godownId}</p>}
                </div>

                <div>
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`input-field ${formErrors.date ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.date && <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <FiPlus />
                <span>{loading ? 'Adding...' : 'Add Paddy Inward'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PaddyInward;
