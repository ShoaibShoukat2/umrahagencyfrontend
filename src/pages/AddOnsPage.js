import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';

const AddOnsPage = ({ navigate, packageData, bookingData }) => {
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    if (packageData) {
      loadAddons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageData]);

  const loadAddons = async () => {
    try {
      const pkg = await api.getPackageBySlug(packageData.slug);
      setAddons(pkg.addons || []);
    } catch (error) {
      console.error('Error loading addons:', error);
    }
  };

  const toggleAddon = (addon, appliesTo, targetId = null) => {
    const key = `${addon.id}-${appliesTo}-${targetId}`;
    const existing = selectedAddons.find(a => `${a.addon_id}-${a.applies_to}-${a.target_id}` === key);
    
    if (existing) {
      setSelectedAddons(selectedAddons.filter(a => `${a.addon_id}-${a.applies_to}-${a.target_id}` !== key));
    } else {
      setSelectedAddons([...selectedAddons, {
        addon_id: addon.id,
        addon_name: addon.name,
        price: addon.price,
        quantity: 1,
        applies_to: appliesTo,
        target_id: targetId
      }]);
    }
  };

  const updateQuantity = (addon, appliesTo, targetId, quantity) => {
    const key = `${addon.id}-${appliesTo}-${targetId}`;
    setSelectedAddons(selectedAddons.map(a => 
      `${a.addon_id}-${a.applies_to}-${a.target_id}` === key ? { ...a, quantity: parseInt(quantity) || 1 } : a
    ));
  };

  const handleNext = () => {
    navigate('checkout', { bookingData: { ...bookingData, addons: selectedAddons } });
  };

  const roomAddons = addons.filter(a => a.addon_type === 'room');
  const personAddons = addons.filter(a => a.addon_type === 'person' || a.addon_type === 'flight');
  const otherAddons = addons.filter(a => a.addon_type === 'other');

  return (
    <div>
      <Navbar navigate={navigate} />
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24 md:pt-28">
        <h1 className="text-3xl font-bold mb-8">Add-ons & Upgrades</h1>

        {/* Room Add-ons */}
        {roomAddons.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Room Add-ons</h2>
            {bookingData.rooms.map(room => (
              <div key={room.room_number} className="mb-6">
                <h3 className="font-bold mb-3">Room {room.room_number}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomAddons.map(addon => {
                    const key = `${addon.id}-room-${room.room_number}`;
                    const selected = selectedAddons.find(a => `${a.addon_id}-${a.applies_to}-${a.target_id}` === key);
                    return (
                      <div key={addon.id} className={`border rounded-lg p-4 cursor-pointer ${selected ? 'border-primary bg-green-50' : ''}`}
                           onClick={() => toggleAddon(addon, 'room', room.room_number)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{addon.name}</h4>
                            <p className="text-sm text-gray-600">{addon.description}</p>
                          </div>
                          <span className="font-bold text-primary">${addon.price}</span>
                        </div>
                        {selected && (
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <label className="text-sm">Quantity:</label>
                            <input type="number" min="1" value={selected.quantity}
                                   onChange={(e) => updateQuantity(addon, 'room', room.room_number, e.target.value)}
                                   className="ml-2 border rounded px-2 py-1 w-20" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Person Add-ons (Flight Upgrades, etc.) */}
        {personAddons.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Personal Add-ons & Flight Upgrades</h2>
            {bookingData.rooms.map(room => {
              const roomPassengers = bookingData.passengers.filter(p => p.room_number === room.room_number);
              return (
                <div key={room.room_number} className="mb-6">
                  <h3 className="font-bold mb-3">Room {room.room_number}</h3>
                  {roomPassengers.map((passenger, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-medium mb-2">{passenger.name} ({passenger.type})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personAddons.map(addon => {
                          const key = `${addon.id}-person-${room.room_number}-${idx}`;
                          const selected = selectedAddons.find(a => `${a.addon_id}-${a.applies_to}-${a.target_id}` === key);
                          return (
                            <div key={addon.id} className={`border rounded-lg p-4 cursor-pointer ${selected ? 'border-primary bg-green-50' : ''}`}
                                 onClick={() => toggleAddon(addon, 'person', `${room.room_number}-${idx}`)}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold">{addon.name}</h5>
                                  <p className="text-sm text-gray-600">{addon.description}</p>
                                </div>
                                <span className="font-bold text-primary">${addon.price}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Other Add-ons */}
        {otherAddons.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Additional Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherAddons.map(addon => {
                const key = `${addon.id}-other-null`;
                const selected = selectedAddons.find(a => `${a.addon_id}-${a.applies_to}-${a.target_id}` === key);
                return (
                  <div key={addon.id} className={`border rounded-lg p-4 cursor-pointer ${selected ? 'border-primary bg-green-50' : ''}`}
                       onClick={() => toggleAddon(addon, 'other', null)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{addon.name}</h4>
                        <p className="text-sm text-gray-600">{addon.description}</p>
                      </div>
                      <span className="font-bold text-primary">${addon.price}</span>
                    </div>
                    {selected && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <label className="text-sm">Quantity:</label>
                        <input type="number" min="1" value={selected.quantity}
                               onChange={(e) => updateQuantity(addon, 'other', null, e.target.value)}
                               className="ml-2 border rounded px-2 py-1 w-20" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {addons.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No add-ons available for this package.</p>
          </div>
        )}

        <div className="flex justify-between">
          <button onClick={() => navigate('passengers', { bookingData })} className="px-6 py-3 border rounded-lg hover:bg-gray-100">
            Back
          </button>
          <button onClick={handleNext} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary">
            Next: Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOnsPage;
