import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';

const CategoryPage = ({ navigate, category }) => {
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]); // For counting in tabs
  const [filters, setFilters] = useState({
    category: '', // Will be set from prop if available
    month: '',
    year: '', // Don't filter by year by default
    min_price: '',
    max_price: '',
    tags: ''
  });
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);

  // Initialize category filter from prop
  useEffect(() => {
    if (category && category !== filters.category) {
      setFilters(prev => ({ ...prev, category }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    loadPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    loadTags();
    loadCategories();
    loadAllPackages(); // Load all packages for tab counts
  }, []);

  const loadPackages = async () => {
    try {
      console.log('=== Loading Packages ===');
      console.log('Category prop:', category);
      console.log('Filters:', filters);
      
      // Build filter params
      const filterParams = {};
      
      // Only add category filter if explicitly set in filters state
      // If filters.category is empty string, show all packages
      if (filters.category) {
        filterParams.category__slug = filters.category;
      }
      
      // Add other filters only if they have values
      if (filters.month) filterParams.month = filters.month;
      if (filters.year) filterParams.year = filters.year;
      if (filters.min_price) filterParams.min_price = filters.min_price;
      if (filters.max_price) filterParams.max_price = filters.max_price;
      if (filters.tags) filterParams.tags = filters.tags;
      
      console.log('Filter params:', filterParams);
      
      const data = await api.getPackages(filterParams);
      console.log('API Response:', data);
      
      const packages = Array.isArray(data) ? data : (data.results || []);
      console.log('Processed packages:', packages.length);
      
      setPackages(packages);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadAllPackages = async () => {
    try {
      const data = await api.getPackages({});
      const packages = Array.isArray(data) ? data : (data.results || []);
      setAllPackages(packages);
    } catch (error) {
      console.error('Error loading all packages:', error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await api.getTags();
      const tagsArray = Array.isArray(data) ? data : (data.results || []);
      setTags(tagsArray);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      const categoriesArray = Array.isArray(data) ? data : (data.results || []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <Navbar navigate={navigate} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24 md:pt-28">
        <h1 className="text-4xl font-bold mb-6 capitalize">
          {filters.category ? (categories.find(c => c.slug === filters.category)?.name || 'All Packages') : 'All Packages'}
        </h1>
        
        {/* Category Tabs */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-3">
          <div className="flex gap-3 overflow-x-auto">
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filters.category === '' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              🌟 All Packages ({allPackages.length})
            </button>
            {categories.filter(cat => cat.category_type === 'package').map(cat => {
              const categoryPackages = allPackages.filter(pkg => pkg.category_name === cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange('category', cat.slug)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    filters.category === cat.slug 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {cat.name} ({categoryPackages.length})
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Filter Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2">
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <select value={filters.month} onChange={(e) => handleFilterChange('month', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2">
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2">
                <option value="">All Years</option>
                {[2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <input type="number" value={filters.min_price} onChange={(e) => handleFilterChange('min_price', e.target.value)}
                     className="w-full border rounded-lg px-3 py-2" placeholder="Min" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <input type="number" value={filters.max_price} onChange={(e) => handleFilterChange('max_price', e.target.value)}
                     className="w-full border rounded-lg px-3 py-2" placeholder="Max" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <select value={filters.tags} onChange={(e) => handleFilterChange('tags', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2">
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.slug}>{tag.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} onClick={() => navigate('package', { package: pkg })}
                 className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition">
              {pkg.featured_image && (
                <img src={pkg.featured_image} alt={pkg.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.short_description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {pkg.tags?.map(tag => (
                    <span key={tag.id} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                      {tag.name}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-2xl font-bold text-primary">${pkg.min_price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{pkg.duration_days}D/{pkg.duration_nights}N</p>
                    <p className="text-sm font-medium">{new Date(pkg.travel_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No packages found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
