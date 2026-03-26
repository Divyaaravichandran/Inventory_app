import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiDollarSign, FiCheckCircle, FiAlertCircle, FiXCircle, FiPlus } from 'react-icons/fi';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { API_BASE_URL } from '../config/api';

const Payments = () => {
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [dealerPaymentData, setDealerPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: '',
  });
  const [dealerPaymentLoading, setDealerPaymentLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger', 'recent', or 'invoices'
  const [ledgerFilter, setLedgerFilter] = useState('all');
  const [showAllLedger, setShowAllLedger] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchLedger();
    fetchSales();
    fetchInvoices();
    fetchRecentPayments();
  }, []);

  const fetchRecentPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`);
      // Sort by paymentDate descending (most recent first)
      const sorted = (response.data || []).sort((a, b) => {
        const dateA = new Date(a.paymentDate || a.createdAt);
        const dateB = new Date(b.paymentDate || b.createdAt);
        return dateB - dateA;
      });
      setRecentPayments(sorted);
    } catch (error) {
      console.error('Failed to load recent payments:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/summary`);
      setSummary(response.data);
    } catch (error) {
      toast.error('Failed to load payment summary');
    }
  };

  const fetchLedger = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/ledger`);
      setLedger(response.data);
    } catch (error) {
      toast.error('Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLedger = async (entry) => {
    setDeletingId(entry.saleId || entry.invoiceId || entry.userOrderId || entry.customer);
    try {
      if (entry.sourceType === 'sale' && entry.saleId) {
        await axios.delete(`http://localhost:5000/api/sales/${entry.saleId}`);
      } else if (entry.sourceType === 'invoice' && entry.invoiceId) {
        await axios.delete(`http://localhost:5000/api/invoices/${entry.invoiceId}`);
      } else if (entry.sourceType === 'userOrder' && entry.userOrderId) {
        await axios.delete(`http://localhost:5000/api/user/admin/orders/${entry.userOrderId}`);
      }
      toast.success('Entry deleted');
      fetchSummary();
      fetchLedger();
      fetchSales();
      fetchInvoices();
      fetchRecentPayments();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete entry';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    setDeletingId(paymentId);
    try {
      await axios.delete(`http://localhost:5000/api/payments/${paymentId}`);
      toast.success('Payment deleted');
      fetchSummary();
      fetchLedger();
      fetchInvoices();
      fetchRecentPayments();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete payment';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    setDeletingId(invoiceId);
    try {
      await axios.delete(`http://localhost:5000/api/invoices/${invoiceId}`);
      toast.success('Invoice deleted');
      fetchSummary();
      fetchLedger();
      fetchInvoices();
      fetchRecentPayments();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete invoice';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDealerPaymentSubmit = async (e) => {
    e.preventDefault();
    const invoice = invoices.find((inv) => inv._id === selectedInvoiceId);
    if (!invoice) {
      toast.error('Please select an invoice');
      return;
    }
    const amount = parseFloat(dealerPaymentData.amount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setDealerPaymentLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/payments`, {
        invoiceId: invoice._id,
        customerName: invoice.dealer?.dealerName || invoice.dealerId,
        amount,
        paymentMethod: dealerPaymentData.paymentMethod,
        referenceNumber: dealerPaymentData.referenceNumber,
        notes: dealerPaymentData.notes,
      });
      toast.success('Dealer invoice payment recorded successfully!');
      setSelectedInvoiceId('');
      setDealerPaymentData({
        amount: '',
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: '',
      });
      fetchInvoices();
      fetchRecentPayments();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to record dealer payment';
      toast.error(message);
    } finally {
      setDealerPaymentLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sales`);
      setSales(response.data.filter((s) => s.paymentStatus !== 'paid'));
    } catch (error) {
      console.error('Failed to load sales');
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/invoices`);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to load invoices');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const currentSale = sales.find((s) => s._id === selectedSaleId);
    if (!currentSale) {
      toast.error('Please select a customer');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/payments`, {
        saleId: currentSale._id,
        customerName: currentSale.customerName,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
      });
      toast.success('Payment recorded successfully!');
      setShowPaymentForm(false);
      setSelectedSaleId('');
      setPaymentData({
        amount: '',
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: '',
      });
      fetchSummary();
      fetchLedger();
      fetchSales();
      fetchInvoices();
      fetchRecentPayments();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to record payment';
      toast.error(message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="text-green-500" />;
      case 'partial':
        return <FiAlertCircle className="text-amber-500" />;
      default:
        return <FiXCircle className="text-red-500" />;
    }
  };

  const paymentChartData = summary
    ? [
        { name: 'Paid', value: summary.totalReceived, color: '#10b981' },
        { name: 'Pending', value: summary.totalPending, color: '#f59e0b' },
      ]
    : [];

  const filteredLedger = ledgerFilter === 'all'
    ? ledger
    : ledger.filter((entry) =>
        ledgerFilter === 'paid' ? entry.status === 'paid' : entry.status !== 'paid'
      );
  const ledgerToShow = showAllLedger ? filteredLedger : filteredLedger.slice(0, 5);
  const paymentsToShow = showAllRecent ? recentPayments : recentPayments.slice(0, 5);
  const invoicesToShow = showAllInvoices ? invoices : invoices.slice(0, 5);

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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Payments Management</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ledger');
              setLedgerFilter('pending');
              setShowAllLedger(true);
            }}
            className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Total Receivable</p>
                <p className="text-3xl font-bold">
                  ₹{summary?.totalReceivable?.toLocaleString() || 0}
                </p>
              </div>
              <FiDollarSign size={32} className="opacity-50" />
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ledger');
              setLedgerFilter('paid');
              setShowAllLedger(true);
            }}
            className="card bg-gradient-to-br from-green-500 to-green-600 text-white text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Received</p>
                <p className="text-3xl font-bold">
                  ₹{summary?.totalReceived?.toLocaleString() || 0}
                </p>
              </div>
              <FiCheckCircle size={32} className="opacity-50" />
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ledger');
              setLedgerFilter('pending');
              setShowAllLedger(true);
            }}
            className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 mb-1">Pending</p>
                <p className="text-3xl font-bold">
                  ₹{summary?.totalPending?.toLocaleString() || 0}
                </p>
              </div>
              <FiAlertCircle size={32} className="opacity-50" />
            </div>
          </button>
        </div>

        {/* Payment Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Payment Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Stats */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Payment Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-3" />
                  <span className="font-semibold text-gray-800">Paid</span>
                </div>
                <span className="text-xl font-bold text-gray-800">
                  {summary?.paidCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <FiAlertCircle className="text-amber-500 mr-3" />
                  <span className="font-semibold text-gray-800">Partial</span>
                </div>
                <span className="text-xl font-bold text-gray-800">
                  {summary?.partialCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <FiXCircle className="text-red-500 mr-3" />
                  <span className="font-semibold text-gray-800">Pending</span>
                </div>
                <span className="text-xl font-bold text-gray-800">
                  {summary?.pendingCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Ledger and Recent Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'ledger'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Customer Ledger
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'recent'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Recent Payments
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'invoices'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Recent Invoices
              </button>
            </div>
            {activeTab === 'ledger' && filteredLedger.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllLedger((v) => !v)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {showAllLedger ? 'Show Less' : 'Show More'}
              </button>
            )}
            {activeTab === 'recent' && recentPayments.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllRecent((v) => !v)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {showAllRecent ? 'Show Less' : 'Show More'}
              </button>
            )}
            {activeTab === 'invoices' && invoices.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllInvoices((v) => !v)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {showAllInvoices ? 'Show Less' : 'Show More'}
              </button>
            )}
            {activeTab === 'ledger' && (
              <button
                onClick={() => {
                  setShowPaymentForm(true);
                  setSelectedSaleId(sales[0]?._id || '');
                }}
                className="btn-primary flex items-center space-x-2"
                disabled={sales.length === 0}
              >
                <FiPlus />
                <span>Record Payment</span>
              </button>
            )}
          </div>

          {activeTab === 'ledger' && (
            <>

          {showPaymentForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-primary-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Record Payment</h4>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Customer (Name &amp; ID)</label>
                    <select
                      className="input-field"
                      value={selectedSaleId}
                      onChange={(e) => setSelectedSaleId(e.target.value)}
                      required
                    >
                      <option value="">Select customer</option>
                      {sales.map((sale) => (
                        <option key={sale._id} value={sale._id}>
                          {sale.customerName} ({sale._id.slice(-6)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Outstanding Balance</label>
                    <input
                      type="text"
                      value={`₹${
                        sales.find((s) => s._id === selectedSaleId)?.balanceAmount?.toLocaleString() ||
                        '0'
                      }`}
                      className="input-field bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="label">Payment Amount *</label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, amount: e.target.value })
                      }
                      className="input-field"
                      step="0.01"
                      max={
                        sales.find((s) => s._id === selectedSaleId)?.balanceAmount || undefined
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Payment Method *</label>
                    <select
                      value={paymentData.paymentMethod}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, paymentMethod: e.target.value })
                      }
                      className="input-field"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Reference Number</label>
                    <input
                      type="text"
                      value={paymentData.referenceNumber}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, referenceNumber: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, notes: e.target.value })
                      }
                      className="input-field"
                      rows="2"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="btn-primary">
                    Record Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedSaleId('');
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Paid
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Balance
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledgerToShow.length > 0 ? (
                  ledgerToShow.map((entry, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">{entry.customer}</div>
                        <div className="text-xs text-gray-600">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-800">
                        ₹{entry.amount?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-green-600 font-semibold">
                        ₹{entry.paid?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-red-600 font-semibold">
                        ₹{entry.balance?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(entry.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              entry.status || 'pending'
                            )}`}
                          >
                            {(entry.status || 'pending').charAt(0).toUpperCase() + (entry.status || 'pending').slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {entry.balance > 0 && entry.status !== 'paid' && (
                            <button
                              onClick={() => {
                                if (entry.sourceType === 'invoice' && entry.invoiceId) {
                                  setSelectedInvoiceId(entry.invoiceId);
                                  setActiveTab('ledger');
                                  document.getElementById('dealer-invoice-payments')?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  const sale = sales.find((s) => s.customerName === entry.customer);
                                  if (sale) {
                                    setSelectedSaleId(sale._id);
                                    setShowPaymentForm(true);
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-primary-500 text-white rounded-lg text-xs font-semibold hover:bg-primary-600"
                            >
                              Pay Now
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteLedger(entry)}
                            disabled={deletingId === (entry.saleId || entry.invoiceId || entry.userOrderId || entry.customer)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200"
                          >
                            {deletingId === (entry.saleId || entry.invoiceId || entry.userOrderId || entry.customer)
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">
                      No ledger entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
            </>
          )}

          {activeTab === 'recent' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Payment ID</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Customer Name</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Mode of Payment</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsToShow.length > 0 ? (
                    paymentsToShow.map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 text-sm text-gray-800 font-medium">
                          #{payment._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-2 text-sm text-gray-800">{payment.customerName}</td>
                        <td className="py-2 text-sm text-gray-800 text-right font-semibold">
                          ₹{payment.amount?.toLocaleString()}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {new Date(payment.paymentDate || payment.createdAt).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2 text-sm text-gray-800 capitalize">
                          {payment.paymentMethod?.replace('_', ' ') || 'Cash'}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          {payment.saleId ? 'Sale' : payment.invoiceId ? 'Invoice' : payment.userOrderId ? 'User Order' : '-'}
                        </td>
                        <td className="py-2 text-sm text-gray-800">
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(payment._id)}
                            disabled={deletingId === payment._id}
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            {deletingId === payment._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        No recent payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Invoice No</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Dealer</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Paid</th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">Balance</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesToShow.length > 0 ? (
                    invoicesToShow.map((inv) => {
                      const paid = inv.paidAmount || 0;
                      const amount = inv.amount || 0;
                      const balance = amount - paid;
                      const status = inv.paymentStatus || (balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'pending');
                      return (
                        <tr key={inv._id} className="border-b hover:bg-gray-50">
                          <td className="py-2 text-sm text-gray-800 font-medium">{inv.invoiceNumber}</td>
                          <td className="py-2 text-sm text-gray-800">
                            {inv.dealer?.dealerName || inv.dealerId || '-'}
                          </td>
                          <td className="py-2 text-sm text-gray-800 text-right">₹{amount?.toLocaleString()}</td>
                          <td className="py-2 text-sm text-green-600 text-right font-semibold">₹{paid?.toLocaleString()}</td>
                          <td className="py-2 text-sm text-red-600 text-right font-semibold">₹{balance?.toLocaleString()}</td>
                          <td className="py-2 text-sm text-gray-800">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                          <td className="py-2 text-sm text-gray-800">
                            {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2 text-sm text-gray-800">
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(inv._id)}
                              disabled={deletingId === inv._id}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              {deletingId === inv._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dealer Invoice Payments */}
        <div id="dealer-invoice-payments" className="mt-8 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Dealer Invoice Payments</h3>
          </div>
          <form onSubmit={handleDealerPaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Dealer Invoice (Dealer &amp; ID)</label>
                <select
                  className="input-field"
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                >
                  <option value="">Select invoice</option>
                  {invoices
                    .filter((inv) => inv.paymentStatus !== 'paid')
                    .map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {(inv.dealer?.dealerName || inv.dealerId) || 'Dealer'} (
                        {inv.dealerId}) - {inv.invoiceNumber}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label">Outstanding Amount</label>
                <input
                  type="text"
                  className="input-field bg-gray-100"
                  disabled
                  value={
                    selectedInvoiceId
                      ? (() => {
                          const inv = invoices.find(
                            (i) => i._id === selectedInvoiceId
                          );
                          if (!inv) return '₹0';
                          const remaining =
                            (inv.amount || 0) - (inv.paidAmount || 0);
                          return `₹${remaining.toLocaleString()}`;
                        })()
                      : '₹0'
                  }
                />
              </div>
              <div>
                <label className="label">Payment Amount *</label>
                <input
                  type="number"
                  className="input-field"
                  value={dealerPaymentData.amount}
                  onChange={(e) =>
                    setDealerPaymentData({
                      ...dealerPaymentData,
                      amount: e.target.value,
                    })
                  }
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="label">Payment Method *</label>
                <select
                  className="input-field"
                  value={dealerPaymentData.paymentMethod}
                  onChange={(e) =>
                    setDealerPaymentData({
                      ...dealerPaymentData,
                      paymentMethod: e.target.value,
                    })
                  }
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Reference Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={dealerPaymentData.referenceNumber}
                  onChange={(e) =>
                    setDealerPaymentData({
                      ...dealerPaymentData,
                      referenceNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={dealerPaymentData.notes}
                  onChange={(e) =>
                    setDealerPaymentData({
                      ...dealerPaymentData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={dealerPaymentLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dealerPaymentLoading ? 'Recording Payment...' : 'Record Dealer Payment'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Payments;
