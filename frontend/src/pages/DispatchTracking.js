import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiTruck, FiMapPin, FiUser, FiCalendar, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const DispatchTracking = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sales`);
      setSales(response.data);
    } catch (error) {
      toast.error('Failed to load dispatch data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (saleId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/sales/${saleId}`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchSales();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'dispatched':
        return <FiTruck className="text-blue-500" />;
      default:
        return <FiClock className="text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const filteredSales = sales.filter((sale) => {
    if (filter === 'all') return true;
    return sale.status === filter;
  });
  const sortedSales = [...filteredSales].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const visibleSales = showAll ? sortedSales : sortedSales.slice(0, 5);

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
          <h1 className="text-3xl font-bold text-gray-800">Dispatch Tracking</h1>
          <div className="flex space-x-2">
            {['all', 'pending', 'dispatched', 'delivered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Dispatches</h2>
            {sortedSales.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {showAll ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vehicle Number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Driver Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Destination
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Dispatch Date
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
                {visibleSales.length > 0 ? (
                  visibleSales.map((sale) => (
                    <tr key={sale._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <FiTruck className="mr-2 text-gray-400" />
                          <span className="text-sm text-gray-800">
                            {sale.vehicleNumber || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-gray-400" />
                          <span className="text-sm text-gray-800">
                            {sale.driverName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {sale.customerName}
                          </div>
                          <div className="text-xs text-gray-600">{sale.riceType}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <FiMapPin className="mr-2 text-gray-400" />
                          <span className="text-sm text-gray-800">
                            {sale.destination || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 text-gray-400" />
                          <span className="text-sm text-gray-800">
                            {new Date(sale.dispatchDate || sale.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(sale.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              sale.status
                            )}`}
                          >
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {sale.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(sale._id, 'dispatched')}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600"
                            >
                              Mark Dispatched
                            </button>
                          )}
                          {sale.status === 'dispatched' && (
                            <button
                              onClick={() => updateStatus(sale._id, 'delivered')}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No dispatch records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Stepper Legend */}
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Guide</h3>
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Pending - Order placed, awaiting dispatch</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Dispatched - On the way</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Delivered - Reached destination</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DispatchTracking;
