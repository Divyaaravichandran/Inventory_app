import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiKey } from 'react-icons/fi';
import { useDealerAuth } from '../context/DealerAuthContext';

const DealerLogin = () => {
  const [dealerId, setDealerId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useDealerAuth();
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    if (!dealerId) nextErrors.dealerId = 'Dealer ID is required';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(dealerId, password);
    setLoading(false);
    if (result.success) navigate('/dealer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rice-50 via-primary-50 to-rice-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link
          to="/"
          className="inline-flex items-center text-primary-700 hover:text-primary-800 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Role Selection
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dealer Login</h1>
            <p className="text-gray-600">Login using your Dealer ID and password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <FiKey className="inline mr-2" />
                Dealer ID
              </label>
              <input
                type="text"
                value={dealerId}
                onChange={(e) => setDealerId(e.target.value)}
                className={`input-field ${errors.dealerId ? 'border-red-500' : ''}`}
                placeholder="DLR0001"
              />
              {errors.dealerId && (
                <p className="mt-1 text-sm text-red-600">{errors.dealerId}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              First time here?{' '}
              <Link
                to="/dealer/setup"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Set your password
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerLogin;


