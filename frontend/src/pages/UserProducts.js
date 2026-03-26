// frontend/src/pages/UserProducts.js
import React, { useCallback, useEffect, useState } from 'react';
import UserLayout from '../components/UserLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiShoppingCart, FiPackage, FiGrid, FiList, FiBox } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [cart, setCart] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/products`);
      setProducts(res.data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('userCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('userCart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const clearCart = () => {
    localStorage.removeItem('userCart');
    setCart([]);
  };

  const filterAndSortProducts = useCallback(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const name = product.name || product.riceName || product.riceType || '';
        const description = product.description || '';
        const searchLower = searchTerm.toLowerCase();
        return name.toLowerCase().includes(searchLower) ||
               description.toLowerCase().includes(searchLower) ||
               (product.riceType && product.riceType.toLowerCase().includes(searchLower));
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const category = product.category || product.riceType || '';
        return category === selectedCategory;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': {
          const nameA = (a.name || a.riceName || a.riceType || '').toString();
          const nameB = (b.name || b.riceName || b.riceType || '').toString();
          return nameA.localeCompare(nameB);
        }
        case 'price-low': {
          const priceA = a.pricePerKg || a.ratePerKg || 0;
          const priceB = b.pricePerKg || b.ratePerKg || 0;
          return priceA - priceB;
        }
        case 'price-high': {
          const priceHighA = a.pricePerKg || a.ratePerKg || 0;
          const priceHighB = b.pricePerKg || b.ratePerKg || 0;
          return priceHighB - priceHighA;
        }
        case 'stock': {
          const stockA = a.totalStock || a.availableQuantity || a.quantity || 0;
          const stockB = b.totalStock || b.availableQuantity || b.quantity || 0;
          return stockB - stockA;
        }
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const addToCart = (product, bagSize, quantity) => {
    if (!bagSize || !quantity || quantity <= 0) {
      toast.error('Please select bag size and quantity');
      return;
    }

    const maxBags = product.bagsStock?.[bagSize] || 0;
    if (maxBags > 0 && parseInt(quantity, 10) > maxBags) {
      toast.error(`Only ${maxBags} bags available for ${bagSize}`);
      return;
    }

    const newCart = [...cart];
    const existingItem = newCart.find(item => 
      item.productId === product._id && item.bagSize === bagSize
    );

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      const productName = product.name || product.riceName || product.riceType || 'Product';
      const pricePerKg = product.ratePerKg || product.pricePerKg || 0;
      newCart.push({
        productId: product._id,
        name: productName,
        riceType: product.riceType,
        brand: product.riceName || product.brand || productName,
        bagSize,
        quantity: parseInt(quantity),
        quantityBags: parseInt(quantity),
        pricePerKg: pricePerKg,
        ratePerKg: pricePerKg,
        totalPrice: pricePerKg * parseInt(bagSize) * parseInt(quantity),
        totalAmount: pricePerKg * parseInt(bagSize) * parseInt(quantity),
        totalQuantityKg: parseInt(bagSize) * parseInt(quantity)
      });
    }

    saveCart(newCart);
    toast.success('Added to cart!');
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category || p.riceType).filter(Boolean))];
    return ['all', ...categories];
  };

  const getStockStatus = (product) => {
    const totalStock = product.totalStock || product.availableQuantity || product.quantity || 0;
    if (totalStock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (totalStock < 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header - Admin style */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search - Admin card style */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FiFilter className="mr-2 text-primary-600" />
            Filter & Search
          </h3>
          <p className="text-sm text-gray-600 mb-4">{filteredProducts.length} of {products.length} products</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock Level</option>
            </select>

            {/* View Mode */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Cart Summary - Admin-style card with gradient accent */}
        {cart.length > 0 && (
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-[1.01] transition-transform duration-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <FiShoppingCart size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold opacity-90">Shopping Cart</h3>
                  <p className="text-sm opacity-90">{cart.length} items</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm opacity-90">Total Amount</p>
                  <p className="text-2xl font-bold">₹{cart.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => window.location.href = '/user/checkout'}
                  className="bg-white text-green-700 font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="bg-white/20 text-white font-semibold py-2 px-6 rounded-lg border border-white/40 hover:bg-white/30 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              
              return viewMode === 'grid' ? (
                /* Grid View - Admin-style bold cards */
                <div key={product._id} className="card hover:shadow-xl transition-all duration-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name || product.riceName || product.riceType || 'Product'}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description || product.riceType || ''}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiBox className="text-white" size={28} />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price per kg</span>
                      <span className="font-bold text-primary-600">₹{product.pricePerKg || product.ratePerKg || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock</span>
                      <span className="font-semibold text-gray-800">{product.totalStock || product.availableQuantity || product.quantity || 0} kg</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium text-gray-700">{product.category || product.riceType || '—'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Available Bags</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      {product.bagsStock?.['5kg'] > 0 && <span>5kg: {product.bagsStock?.['5kg']}</span>}
                      {product.bagsStock?.['10kg'] > 0 && <span>10kg: {product.bagsStock?.['10kg']}</span>}
                      {product.bagsStock?.['25kg'] > 0 && <span>25kg: {product.bagsStock?.['25kg']}</span>}
                      {product.bagsStock?.['75kg'] > 0 && <span>75kg: {product.bagsStock?.['75kg']}</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <select
                      ref={(el) => product.selectRef = el}
                      className="input-field"
                    >
                      <option value="">Select bag size</option>
                      {product.bagsStock?.['5kg'] > 0 && <option value="5kg">5kg</option>}
                      {product.bagsStock?.['10kg'] > 0 && <option value="10kg">10kg</option>}
                      {product.bagsStock?.['25kg'] > 0 && <option value="25kg">25kg</option>}
                      {product.bagsStock?.['75kg'] > 0 && <option value="75kg">75kg</option>}
                    </select>
                    <input
                      ref={(el) => product.inputRef = el}
                      type="number"
                      placeholder="Quantity"
                      min="1"
                      className="input-field"
                    />
                    <button
                      onClick={() => {
                        const bagSize = product.selectRef?.value;
                        const quantity = product.inputRef?.value;
                        addToCart(product, bagSize, quantity);
                      }}
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      <FiShoppingCart className="mr-2" size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ) : (
                /* List View - Admin table-like row */
                <div key={product._id} className="card hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiBox className="text-white" size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800">{product.name || product.riceName || product.riceType || 'Product'}</h3>
                        <p className="text-sm text-gray-600 truncate">{product.description || product.riceType || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Price/kg</p>
                        <p className="font-bold text-primary-600">₹{product.pricePerKg || product.ratePerKg || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Stock</p>
                        <p className="font-semibold text-gray-800">{product.totalStock || product.availableQuantity || product.quantity || 0} kg</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-4 border-t border-gray-100 pt-4">
                    <select
                      ref={(el) => product.selectRef = el}
                      className="input-field flex-1 max-w-[140px]"
                    >
                      <option value="">Bag size</option>
                      {product.bagsStock?.['5kg'] > 0 && <option value="5kg">5kg</option>}
                      {product.bagsStock?.['10kg'] > 0 && <option value="10kg">10kg</option>}
                      {product.bagsStock?.['25kg'] > 0 && <option value="25kg">25kg</option>}
                      {product.bagsStock?.['75kg'] > 0 && <option value="75kg">75kg</option>}
                    </select>
                    <input
                      ref={(el) => product.inputRef = el}
                      type="number"
                      placeholder="Qty"
                      min="1"
                      className="input-field w-24"
                    />
                    <button
                      onClick={() => {
                        const bagSize = product.selectRef?.value;
                        const quantity = product.inputRef?.value;
                        addToCart(product, bagSize, quantity);
                      }}
                      className="btn-primary flex items-center justify-center"
                    >
                      <FiShoppingCart className="mr-2" size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('name');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserProducts;