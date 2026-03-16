import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const DealerAuthContext = createContext(null);

export const useDealerAuth = () => {
  const ctx = useContext(DealerAuthContext);
  if (!ctx) {
    throw new Error('useDealerAuth must be used within DealerAuthProvider');
  }
  return ctx;
};

export const DealerAuthProvider = ({ children }) => {
  const [dealerUser, setDealerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('dealerToken'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchDealer();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDealer = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dealer-auth/me`);
      setDealerUser(res.data.user);
    } catch (error) {
      localStorage.removeItem('dealerToken');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (dealerId, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/dealer-auth/login`, {
        dealerId,
        password,
      });
      const { token: jwt, user } = res.data;
      localStorage.setItem('dealerToken', jwt);
      setToken(jwt);
      setDealerUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      toast.success('Logged in successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (dealerId, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/dealer-auth/register`, {
        dealerId,
        password,
      });
      const { token: jwt, user } = res.data;
      localStorage.setItem('dealerToken', jwt);
      setToken(jwt);
      setDealerUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      toast.success('Password set successfully');
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('dealerToken');
    setToken(null);
    setDealerUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <DealerAuthContext.Provider
      value={{
        dealerUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!dealerUser,
      }}
    >
      {children}
    </DealerAuthContext.Provider>
  );
};

