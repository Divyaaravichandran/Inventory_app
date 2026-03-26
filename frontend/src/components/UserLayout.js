import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';

const UserLayout = ({ children }) => {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  const menuItems = [
    { path: '/user/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/user/products', icon: FiShoppingCart, label: 'Products' },
    { path: '/user/orders', icon: FiPackage, label: 'My Orders' },
    { path: '/user/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4 flex items-center justify-between">
        <h1 className="text-sm font-bold text-primary-700">Kongu Hi-Tech Rice Industries</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-700 font-bold text-xl">K</span>
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">Kongu Hi-Tech Rice Industries</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-primary-700 shadow-lg'
                      : 'hover:bg-primary-700 text-primary-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-8 pt-8 border-t border-primary-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-700 transition-all text-primary-100"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header - matches Admin Layout */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rice-400 to-rice-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🌾</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    Kongu Hi-Tech Rice Industries
                  </h1>
                  <p className="text-xs text-gray-500">Customer Portal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">Customer</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <FiLogOut size={20} />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default UserLayout;
