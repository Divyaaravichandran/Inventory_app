<<<<<<< HEAD
=======
﻿// eslint-disable-next-line unicode-bom
>>>>>>> 9eb8d57523f0d370b10ba7ab17c44fa947f77164
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const RiceSales = () => {
  const BAG_SIZES = ['5kg', '10kg', '25kg', '75kg'];
  const BAG_WEIGHTS = { '5kg': 5, '10kg': 10, '25kg': 25, '75kg': 75 };
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    customerAddress: '',
    riceType: '',
    paddyId: '',
    bagSize: '',
    quantityBags: '',
    quantity: '',
    rate: '',
    vehicleNumber: '',
    driverName: '',
    destination: '',
  });
  const [contactError, setContactError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [dealerOrders, setDealerOrders] = useState([]);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [riceStock, setRiceStock] = useState([]);
  const [paddyBatches, setPaddyBatches] = useState([]);
  const [expandedSaleId, setExpandedSaleId] = useState(null);

  useEffect(() => {
    fetchSales();
    fetchDealersAndOrders();
    fetchRiceStock();
    fetchPaddyBatches();
  }, []);

  useEffect(() => {
    let qty = parseFloat(formData.quantity) || 0;
    if (formData.bagSize && formData.quantityBags) {
      const bags = parseInt(formData.quantityBags, 10) || 0;
      qty = bags * (BAG_WEIGHTS[formData.bagSize] || 0);
    }
    const rate = parseFloat(formData.rate) || 0;
    setTotalAmount(qty * rate);
  }, [formData.quantity, formData.quantityBags, formData.bagSize, formData.rate]);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sales`);
      setSales(response.data);
    } catch (error) {
      toast.error('Failed to load sales');
    }
  };

  const fetchDealersAndOrders = async () => {
    try {
      const [dealersRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/dealers`),
        axios.get(`${API_BASE_URL}/api/dealer-orders`),
      ]);
      setDealers(dealersRes.data || []);
      setDealerOrders(ordersRes.data || []);
    } catch (error) {
      console.error('Failed to load dealer data:', error);
    }
  };

  const fetchRiceStock = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rice`);
      // Filter only rice items with stock > 0
      const availableRice = (response.data || []).filter(
        (rice) => rice.quantity > 0 && rice.status !== 'sold'
      );
      setRiceStock(availableRice);
    } catch (error) {
      console.error('Failed to load rice stock:', error);
    }
  };

  const fetchPaddyBatches = async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/api/paddy`);
=======
      const response = await axios.get('https://inventoryapp-7kj0.onrender.com/api/paddy');
>>>>>>> 9eb8d57523f0d370b10ba7ab17c44fa947f77164
      setPaddyBatches(response.data || []);
    } catch (error) {
      console.error('Failed to load paddy batches:', error);
    }
  };

  const validateContact = (contact) => {
    // Remove any non-digit characters
    const digitsOnly = contact.replace(/\D/g, '');
    
    if (digitsOnly.length === 0) {
      return { valid: false, message: '' };
    }
    
    if (digitsOnly.length !== 10) {
      return { valid: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    
    return { valid: true, message: '' };
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate Customer Name
    if (!formData.customerName || formData.customerName.trim().length === 0) {
      errors.customerName = 'Customer name is required';
      isValid = false;
    } else if (formData.customerName.trim().length < 2) {
      errors.customerName = 'Customer name must be at least 2 characters';
      isValid = false;
    }

    // Validate Contact Number
    const contactValidation = validateContact(formData.customerContact);
    if (!contactValidation.valid) {
      errors.customerContact = contactValidation.message || 'Please enter a valid 10-digit mobile number.';
      isValid = false;
    }

    // Validate Rice Type
    if (!formData.riceType || formData.riceType.trim().length === 0) {
      errors.riceType = 'Rice type is required';
      isValid = false;
    }
    if (!formData.paddyId || formData.paddyId.trim().length === 0) {
      errors.paddyId = 'Paddy ID is required';
      isValid = false;
    }

    // Validate Quantity (from bags or direct)
    let quantity = 0;
    if (formData.bagSize && formData.quantityBags) {
      const bags = parseInt(formData.quantityBags, 10);
      if (isNaN(bags) || bags <= 0) {
        errors.quantityBags = 'Enter valid number of bags';
        isValid = false;
      } else {
        quantity = bags * (BAG_WEIGHTS[formData.bagSize] || 0);
      }
    } else {
      quantity = parseFloat(formData.quantity);
    }
    if (quantity <= 0) {
      errors.quantity = 'Enter quantity (bags or kg)';
      isValid = false;
    }

    // Validate Rate
    const rate = parseFloat(formData.rate);
    if (!formData.rate || isNaN(rate) || rate <= 0) {
      errors.rate = 'Please enter a valid rate greater than 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }

    // Validate contact number
    if (name === 'customerContact') {
      const validation = validateContact(value);
      setContactError(validation.message);
      if (validation.message) {
        setFormErrors({
          ...formErrors,
          customerContact: validation.message,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate entire form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    let quantity = parseFloat(formData.quantity) || 0;
    if (formData.bagSize && formData.quantityBags) {
      const bags = parseInt(formData.quantityBags, 10) || 0;
      quantity = bags * (BAG_WEIGHTS[formData.bagSize] || 0);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/sales`, {
        ...formData,
        customerContact: formData.customerContact.replace(/\D/g, ''), // Store only digits
        quantity,
        rate: parseFloat(formData.rate),
      });
      toast.success('Sale recorded successfully!');
      setFormData({
        customerName: '',
        customerContact: '',
        customerAddress: '',
        riceType: '',
        paddyId: '',
        bagSize: '',
        quantityBags: '',
        quantity: '',
        rate: '',
        vehicleNumber: '',
        driverName: '',
        destination: '',
      });
      setContactError('');
      setFormErrors({});
      setTotalAmount(0);
      fetchSales();
      fetchRiceStock(); // Refresh rice stock after sale
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to record sale';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrdersForDealer = selectedDealerId
    ? dealerOrders.filter(
        (o) =>
          o.dealerId === selectedDealerId &&
          ['approved', 'dispatched', 'delivered'].includes(o.status)
      )
    : [];

  const getSuggestedInvoiceAmount = (order) => {
    if (!order) return '';
    const total =
      Number(order.totalAmount || 0) ||
      (Number(order.totalQuantityKg || 0) * Number(order.ratePerKg || 0));
    return total > 0 ? total.toFixed(2) : '';
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedDealerId || !selectedOrderId || !invoiceAmount) {
      toast.error('Please select dealer, order, and amount');
      return;
    }
    setInvoiceLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/invoices`, {
        dealerId: selectedDealerId,
        orderId: selectedOrderId,
        amount: parseFloat(invoiceAmount),
        notes: invoiceNotes,
      });
      toast.success('Invoice created and sent to dealer');
      setSelectedDealerId('');
      setSelectedOrderId('');
      setInvoiceAmount('');
      setInvoiceNotes('');
      fetchDealersAndOrders();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to create invoice';
      toast.error(message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Rice Sales Entry</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FiShoppingCart className="mr-2" />
                New Sale Entry
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Customer Name *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className={`input-field ${formErrors.customerName ? 'border-red-500' : ''}`}
                        placeholder="Enter customer name"
                        required
                      />
                      {formErrors.customerName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.customerName}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Contact Number *</label>
                      <input
                        type="text"
                        name="customerContact"
                        value={formData.customerContact}
                        onChange={handleChange}
                        className={`input-field ${contactError || formErrors.customerContact ? 'border-red-500' : ''}`}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        required
                      />
                      {(contactError || formErrors.customerContact) && (
                        <p className="mt-1 text-sm text-red-600">{contactError || formErrors.customerContact}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Address</label>
                      <textarea
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleChange}
                        className="input-field"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>

                {/* Rice Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Rice Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Paddy ID *</label>
                      <select
                        name="paddyId"
                        value={formData.paddyId}
                        onChange={handleChange}
                        className={`input-field ${formErrors.paddyId ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Select Paddy Batch</option>
                        {paddyBatches.length > 0 ? (
                          paddyBatches.map((paddy) => (
                            <option key={paddy._id} value={paddy.paddyId}>
                              {paddy.paddyId} - {paddy.paddyType} ({paddy.weight} tons)
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No paddy batches available</option>
                        )}
                      </select>
                      {formErrors.paddyId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.paddyId}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Rice Type *</label>
                      <select
                        name="riceType"
                        value={formData.riceType}
                        onChange={handleChange}
                        className={`input-field ${formErrors.riceType ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Select Rice Type</option>
                        {riceStock.length > 0 ? (
                          riceStock.map((rice) => (
                            <option key={rice._id} value={rice.riceType}>
                              {rice.riceType} - {rice.riceName} ({rice.quantity} kg available)
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No rice available in stock</option>
                        )}
                      </select>
                      {formErrors.riceType && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.riceType}</p>
                      )}
                      {riceStock.length === 0 && !formErrors.riceType && (
                        <p className="mt-1 text-sm text-amber-600">No rice items with available stock</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Bag Size</label>
                      <select
                        name="bagSize"
                        value={formData.bagSize}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select bag size (optional)</option>
                        {BAG_SIZES.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">No. of Bags</label>
                      <input
                        type="number"
                        name="quantityBags"
                        value={formData.quantityBags}
                        onChange={handleChange}
                        className={`input-field ${formErrors.quantityBags ? 'border-red-500' : ''}`}
                        placeholder="If using bag size"
                        min="1"
                      />
                      {formErrors.quantityBags && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.quantityBags}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Quantity (kg) *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={
                          formData.bagSize && formData.quantityBags
                            ? (parseInt(formData.quantityBags, 10) || 0) * (BAG_WEIGHTS[formData.bagSize] || 0)
                            : formData.quantity
                        }
                        onChange={handleChange}
                        className={`input-field ${formErrors.quantity ? 'border-red-500' : ''}`}
                        step="0.01"
                        min="0.01"
                        placeholder={formData.bagSize ? 'Auto from bags' : 'Enter quantity'}
                        readOnly={!!(formData.bagSize && formData.quantityBags)}
                        required
                      />
                      {formErrors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Rate (₹/kg) *</label>
                      <input
                        type="number"
                        name="rate"
                        value={formData.rate}
                        onChange={handleChange}
                        className={`input-field ${formErrors.rate ? 'border-red-500' : ''}`}
                        step="0.01"
                        min="0.01"
                        placeholder="Enter rate per kg"
                        required
                      />
                      {formErrors.rate && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.rate}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">Total Amount</label>
                      <div className="input-field bg-primary-50 border-primary-200 text-primary-700 font-bold text-lg">
                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatch Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Dispatch Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">Driver Name</label>
                      <input
                        type="text"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Destination</label>
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Recording Sale...' : 'Record Sale'}
                </button>
              </form>
            </div>
          </div>

          {/* Right column: recent sales + dealer invoice */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Sales
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sales.slice(0, 10).map((sale) => {
                  const isOpen = expandedSaleId === sale._id;
                  return (
                    <div key={sale._id} className="p-3 bg-gray-50 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setExpandedSaleId(isOpen ? null : sale._id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-800">
                            {sale.customerName}
                          </span>
                          <span className="text-xs text-gray-600">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {sale.riceType} - {sale.quantity} kg
                        </div>
                        <div className="text-sm font-bold text-primary-700 mt-1">
                          ₹{sale.totalAmount?.toLocaleString()}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <div>Contact: {sale.customerContact || '?'}</div>
                          <div>Address: {sale.customerAddress || '?'}</div>
                          <div>Paddy ID: {sale.paddyId || '?'}</div>
                          <div>Bag Size: {sale.bagSize || '?'} | Bags: {sale.quantityBags || '?'}</div>
                          <div>Rate: ₹{sale.rate || 0}/kg</div>
                          <div>Vehicle: {sale.vehicleNumber || '?'} | Driver: {sale.driverName || '?'}</div>
                          <div>Destination: {sale.destination || '?'}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {sales.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No sales yet
                  </p>
                )}
              </div>
            </div>

            {/* Dealer Invoice creation */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiDollarSign className="mr-2" />
                Create Dealer Invoice
              </h2>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <label className="label">Dealer</label>
                  <select
                    className="input-field"
                    value={selectedDealerId}
                    onChange={(e) => {
                      setSelectedDealerId(e.target.value);
                      setSelectedOrderId('');
                    }}
                  >
                    <option value="">Select Dealer</option>
                    {dealers
                      .filter((d) => d.status === 'active')
                      .map((dealer) => (
                        <option key={dealer._id} value={dealer.dealerId}>
                          {dealer.dealerName} ({dealer.dealerId})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="label">Dealer Order</label>
                  <select
                    className="input-field"
                    value={selectedOrderId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedOrderId(id);
                      const selected = filteredOrdersForDealer.find((o) => o._id === id);
                      const suggested = getSuggestedInvoiceAmount(selected);
                      if (suggested) setInvoiceAmount(String(suggested));
                    }}
                    disabled={!selectedDealerId || filteredOrdersForDealer.length === 0}
                  >
                    <option value="">
                      {selectedDealerId
                        ? filteredOrdersForDealer.length > 0
                          ? 'Select Order'
                          : 'No approved orders'
                        : 'Select dealer first'}
                    </option>
                    {filteredOrdersForDealer.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.riceType} - {order.brand} | {order.quantityBags} x{' '}
                        {order.bagSize} ({order.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Invoice Amount (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input-field"
                    rows="2"
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={invoiceLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {invoiceLoading ? 'Creating Invoice...' : 'Create Invoice'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RiceSales;

