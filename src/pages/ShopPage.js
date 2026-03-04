import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';
import { useCart } from '../context/CartContext';

const ShopPage = ({ navigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.getItems();
      const itemsArray = Array.isArray(data) ? data : (data.results || []);
      setItems(itemsArray);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
    toast.innerHTML = `✓ ${item.name} added to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  return (
    <div>
      <Navbar navigate={navigate} />
      
      {/* Hero Section */}
      <div className="gradient-bg text-white py-20 pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-slide-down">
            Travel Essentials Shop
          </h1>
          <p className="text-xl text-green-50 animate-slide-up">
            Everything you need for your spiritual journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <p className="text-xl text-gray-500">Loading products...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-500">No items available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden group animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}>
                <div className="relative h-64 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-8xl">📦</span>
                  )}
                  {item.stock_quantity > 0 && item.stock_quantity < 10 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Only {item.stock_quantity} left!
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">${item.price}</p>
                      {item.stock_quantity > 0 ? (
                        <p className="text-sm text-green-600">✓ In Stock</p>
                      ) : (
                        <p className="text-sm text-red-600">✗ Out of Stock</p>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock_quantity === 0}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none shadow-lg">
                    {item.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
