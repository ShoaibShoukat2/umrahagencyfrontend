import React, { useState, useEffect } from 'react';
import './QRCodeManager.css';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const QRCodeManager = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [roomingList, setRoomingList] = useState(null);
  const [generatedTags, setGeneratedTags] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rooming');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/`);
      const data = await response.json();
      setPackages(data.results || data);
      
      if (data.length > 0) {
        setSelectedPackage(data[0]);
        loadRoomingList(data[0].id);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadRoomingList = async (packageId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qr/rooming-list/${packageId}/`);
      const data = await response.json();
      
      if (data.success) {
        setRoomingList(data.rooming_data);
      }
    } catch (error) {
      console.error('Error loading rooming list:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateIdTag = async (passengerId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qr/id-tag/passenger/${passengerId}/`);
      const data = await response.json();
      
      if (data.success) {
        setGeneratedTags(prev => ({
          ...prev,
          [`id_${passengerId}`]: data
        }));
        alert('ID tag generated successfully!');
      }
    } catch (error) {
      console.error('Error generating ID tag:', error);
      alert('Failed to generate ID tag');
    } finally {
      setLoading(false);
    }
  };

  const generateBagTag = async (passengerId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qr/bag-tag/passenger/${passengerId}/`);
      const data = await response.json();
      
      if (data.success) {
        setGeneratedTags(prev => ({
          ...prev,
          [`bag_${passengerId}`]: data
        }));
        alert('Bag tag generated successfully!');
      }
    } catch (error) {
      console.error('Error generating bag tag:', error);
      alert('Failed to generate bag tag');
    } finally {
      setLoading(false);
    }
  };

  const generateBulkTags = async (tagType) => {
    if (!selectedPackage) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qr/bulk-tags/${selectedPackage.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_type: tagType }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store generated tags
        const newTags = {};
        data.tags.forEach(tag => {
          const pid = tag.passenger_id || tag.customer_id;
          if (tag.id_tag) {
            newTags[`id_${pid}`] = tag;
          }
          if (tag.bag_tag) {
            newTags[`bag_${pid}`] = tag;
          }
        });
        
        setGeneratedTags(prev => ({ ...prev, ...newTags }));
        alert(`Generated ${tagType} tags for ${data.total_passengers || data.total_customers} passengers!`);
      }
    } catch (error) {
      console.error('Error generating bulk tags:', error);
      alert('Failed to generate tags');
    } finally {
      setLoading(false);
    }
  };

  const printRoomingList = () => {
    if (!selectedPackage) return;
    
    const printUrl = `${API_BASE_URL}/qr/rooming-list/${selectedPackage.id}/print/`;
    window.open(printUrl, '_blank');
  };

  const downloadTag = (tagImage, customerName, tagType) => {
    const link = document.createElement('a');
    link.href = tagImage;
    link.download = `${tagType}_tag_${customerName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="qr-code-manager">
      <div className="qr-header">
        <h2>🏷️ QR Code & Rooming Manager</h2>
        <p>Generate ID tags, bag tags, and manage room assignments</p>
      </div>

      {/* Package Selector */}
      <div className="package-selector">
        <label>Select Package:</label>
        <select
          value={selectedPackage?.id || ''}
          onChange={(e) => {
            const pkg = packages.find(p => p.id === parseInt(e.target.value));
            setSelectedPackage(pkg);
            if (pkg) loadRoomingList(pkg.id);
          }}
        >
          <option value="">Select a package...</option>
          {packages.map(pkg => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} - {pkg.travel_date}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'rooming' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooming')}
        >
          🏨 Rooming List
        </button>
        <button
          className={`tab-button ${activeTab === 'id-tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('id-tags')}
        >
          🏷️ ID Tags
        </button>
        <button
          className={`tab-button ${activeTab === 'bag-tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('bag-tags')}
        >
          🎒 Bag Tags
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {/* Rooming List Tab */}
      {activeTab === 'rooming' && roomingList && (
        <div className="tab-content">
          <div className="action-buttons">
            <button className="print-button" onClick={printRoomingList}>
              🖨️ Print Rooming List
            </button>
          </div>

          <div className="rooming-summary">
            <h3>{roomingList.package.name}</h3>
            <div className="stats">
              <span>👥 {roomingList.total_customers} customers</span>
              <span>🏨 {roomingList.total_rooms} rooms</span>
              <span>📅 {roomingList.package.travel_date}</span>
            </div>
          </div>

          <div className="rooms-grid">
            {Object.entries(roomingList.rooms).map(([roomKey, roomData]) => (
              <div key={roomKey} className="room-card">
                <div className="room-header">
                  <h4>{roomKey}</h4>
                  <span className="room-type">{roomData.room_type}</span>
                </div>
                
                <div className="customers-list">
                  {roomData.customers.map((customer, index) => (
                    <div key={index} className="customer-row">
                      <div className="customer-info">
                        <strong>{customer.name}</strong>
                        <div className="customer-details">
                          {customer.booking_number} • {customer.passenger_type} • {customer.gender}
                        </div>
                        <div className="emergency-contact">
                          Emergency: {customer.emergency_contact}
                        </div>
                      </div>
                      <div className="customer-actions">
                        <button
                          className="tag-btn id-tag-btn"
                          onClick={() => generateIdTag(customer.passenger_id || customer.id)}
                          title="Generate ID Tag"
                        >
                          🏷️
                        </button>
                        <button
                          className="tag-btn bag-tag-btn"
                          onClick={() => generateBagTag(customer.passenger_id || customer.id)}
                          title="Generate Bag Tag"
                        >
                          🎒
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ID Tags Tab */}
      {activeTab === 'id-tags' && (
        <div className="tab-content">
          <div className="action-buttons">
            <button
              className="bulk-button"
              onClick={() => generateBulkTags('id')}
              disabled={loading}
            >
              🏷️ Generate All ID Tags
            </button>
          </div>

          <div className="tags-grid">
            {Object.entries(generatedTags)
              .filter(([key]) => key.startsWith('id_'))
              .map(([key, tagData]) => (
                <div key={key} className="tag-card">
                  <h4>{tagData.customer_name}</h4>
                  <img src={tagData.id_tag} alt="ID Tag" className="tag-image" />
                  <div className="tag-actions">
                    <button
                      className="download-btn"
                      onClick={() => downloadTag(tagData.id_tag, tagData.customer_name, 'ID')}
                    >
                      💾 Download
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bag Tags Tab */}
      {activeTab === 'bag-tags' && (
        <div className="tab-content">
          <div className="action-buttons">
            <button
              className="bulk-button"
              onClick={() => generateBulkTags('bag')}
              disabled={loading}
            >
              🎒 Generate All Bag Tags
            </button>
          </div>

          <div className="tags-grid">
            {Object.entries(generatedTags)
              .filter(([key]) => key.startsWith('bag_'))
              .map(([key, tagData]) => (
                <div key={key} className="tag-card">
                  <h4>{tagData.customer_name}</h4>
                  <img src={tagData.bag_tag} alt="Bag Tag" className="tag-image" />
                  <div className="tag-actions">
                    <button
                      className="download-btn"
                      onClick={() => downloadTag(tagData.bag_tag, tagData.customer_name, 'Bag')}
                    >
                      💾 Download
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeManager;