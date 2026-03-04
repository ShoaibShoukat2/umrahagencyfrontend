import React, { useState, useEffect } from 'react';

function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);

  // CONFIGURATION: Set your ad type and content here
  const adConfig = {
    type: 'image', // Options: 'image' or 'content'
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=1000&fit=crop', // Your ad image URL
    linkUrl: '', // Optional: URL to redirect when image is clicked
  };

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('promoPopupShown');
    
    if (!popupShown) {
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('promoPopupShown', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleImageClick = () => {
    if (adConfig.linkUrl) {
      window.open(adConfig.linkUrl, '_blank');
    }
  };

  if (!isVisible) return null;

  // IMAGE AD TYPE
  if (adConfig.type === 'image') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Image Ad */}
          <div 
            onClick={handleImageClick}
            className={`${adConfig.linkUrl ? 'cursor-pointer' : ''}`}>
            <img 
              src={adConfig.imageUrl} 
              alt="Promotional Ad" 
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    );
  }

  // CONTENT AD TYPE (Original design)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Popup Content */}
        <div className="relative">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white p-6 text-center">
            <div className="text-4xl md:text-5xl mb-3 animate-bounce">🕋</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Special Ramadan Offer!</h2>
            <p className="text-base md:text-lg opacity-90">Limited Time Only</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="inline-block bg-red-500 text-white px-4 py-1.5 rounded-full text-base font-bold mb-3 animate-pulse">
                🎉 UP TO 30% OFF
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Ramadan Umrah Packages 2026
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Book now and save on your spiritual journey!
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">✈️</span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Return Flights</h4>
                  <p className="text-xs text-gray-600">Direct flights</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">🏨</span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">4-Star Hotels</h4>
                  <p className="text-xs text-gray-600">Near Haram</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">🍽️</span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Meals Included</h4>
                  <p className="text-xs text-gray-600">Breakfast & Dinner</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">👨‍🏫</span>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Expert Guides</h4>
                  <p className="text-xs text-gray-600">Experienced team</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600 line-through">Was: $2500</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">Now: $1750</p>
                  <p className="text-xs text-gray-600">per person</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Save</p>
                  <p className="text-xl md:text-2xl font-bold text-red-500">$750</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-full font-bold text-sm md:text-base hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg">
                View Packages
              </button>
              <button
                onClick={handleClose}
                className="flex-1 border-2 border-green-500 text-green-600 py-3 rounded-full font-bold text-sm md:text-base hover:bg-green-50 transition-all">
                Contact Us
              </button>
            </div>

            {/* Countdown Timer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                ⏰ Offer ends in: <span className="font-bold text-red-500">7 Days</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromoPopup;
