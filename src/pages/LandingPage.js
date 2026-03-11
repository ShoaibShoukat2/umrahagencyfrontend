import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';
import { useCart } from '../context/CartContext';

const LandingPage = ({ navigate }) => {
  const [categories, setCategories] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, packagesData, itemsData] = await Promise.all([
        api.getCategories(),
        api.getFeaturedPackages(),
        api.getItems()
      ]);
      
      const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []);
      const packages = Array.isArray(packagesData) ? packagesData : (packagesData.results || []);
      const items = Array.isArray(itemsData) ? itemsData : (itemsData.results || []);
      
      setCategories(categories.filter(c => c.category_type !== 'item'));
      setFeaturedPackages(packages);
      setItems(items.slice(0, 4));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="bg-white">
      <Navbar navigate={navigate} />
      
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&h=1080&fit=crop" 
            alt="Kaaba" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="inline-block mb-6">
              <span className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold tracking-wide">
                TRUSTED TRAVEL PARTNER
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Journey to
              <span className="block text-green-400">Sacred Places</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              Experience the spiritual journey of a lifetime with our expertly crafted Umrah and Hajj packages
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('category', { category: 'umrah-packages' })}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-xl">
                Explore Packages
              </button>
              <button 
                onClick={() => navigate('portal')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                My Bookings
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
                <div className="text-gray-300 text-sm">Happy Pilgrims</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">15+</div>
                <div className="text-gray-300 text-sm">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
                <div className="text-gray-300 text-sm">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* 2 Column Section - Image & Intro */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=600&fit=crop" 
                  alt="Umrah Journey" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-xl shadow-xl">
                <div className="text-4xl font-bold">15+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>

            {/* Intro Message Column */}
            <div>
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                ABOUT US
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Trusted Partner for Sacred Journeys
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                For over 15 years, we have been dedicated to providing exceptional Umrah and Hajj experiences. Our commitment to excellence and attention to detail ensures that your spiritual journey is both meaningful and comfortable.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We understand the significance of this sacred pilgrimage and work tirelessly to make your journey seamless, from the moment you book until you return home with cherished memories.
              </p>
              
              {/* Key Points */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Licensed & Certified</h4>
                    <p className="text-gray-600 text-sm">Fully authorized by government authorities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Expert Team</h4>
                    <p className="text-gray-600 text-sm">Experienced guides and support staff</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Premium Services</h4>
                    <p className="text-gray-600 text-sm">Quality accommodation and transportation</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('category', { category: 'umrah-packages' })}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                Explore Our Packages →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select from our carefully curated packages designed for your spiritual needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => navigate('category', { category: category.category_type })}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-gray-200 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center text-green-400 font-semibold">
                    <span>Explore</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages - Premium Design */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured Packages
              </h2>
              <p className="text-xl text-gray-600">
                Handpicked deals for your perfect journey
              </p>
            </div>
            <button 
              onClick={() => navigate('category', { category: 'umrah-packages' })}
              className="hidden md:block text-green-600 font-semibold hover:text-green-700 flex items-center">
              View All
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPackages.slice(0, 6).map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => navigate('package', { package: pkg })}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={pkg.featured_image} 
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {pkg.is_featured && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{pkg.duration_days} Days / {pkg.duration_nights} Nights</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {pkg.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {pkg.short_description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-500">Starting from</div>
                      <div className="text-2xl font-bold text-green-600">${pkg.min_price}</div>
                    </div>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Modern Grid */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your trusted partner for a seamless spiritual journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '✓', title: 'Verified & Licensed', desc: 'Fully licensed travel agency with government approval' },
              { icon: '💰', title: 'Best Price Guarantee', desc: 'Competitive pricing with flexible payment options' },
              { icon: '👥', title: 'Expert Guidance', desc: 'Experienced guides for your entire journey' },
              { icon: '🏨', title: 'Premium Hotels', desc: 'Comfortable stays near Haram' },
              { icon: '🚗', title: 'Transportation', desc: 'Hassle-free airport transfers and local transport' },
              { icon: '📞', title: '24/7 Support', desc: 'Round-the-clock assistance for peace of mind' },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-8 hover:bg-gray-750 transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews / Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Pilgrims Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmad Abdullah',
                location: 'Singapore',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
                review: 'Alhamdulillah, the entire Umrah journey was smooth and well-organized. The hotels were close to Haram and the guides were very knowledgeable. Highly recommended!',
                package: 'Umrah Premium Package'
              },
              {
                name: 'Fatima Hassan',
                location: 'Singapore',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
                review: 'Best decision to book with them. Everything was taken care of from visa to accommodation. The team was very responsive and helpful throughout.',
                package: 'Hajj Deluxe Package'
              },
              {
                name: 'Ibrahim Mohamed',
                location: 'Singapore',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
                review: 'Professional service and great value for money. The group was well-managed and we had a wonderful spiritual experience. JazakAllah khair!',
                package: 'Umrah Economy Package'
              },
              {
                name: 'Aisha Rahman',
                location: 'Singapore',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
                review: 'The attention to detail was impressive. From the comfortable transportation to the quality hotels, everything exceeded our expectations.',
                package: 'Ziarah Tour'
              },
              {
                name: 'Yusuf Ali',
                location: 'Singapore',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
                review: 'Went with my family and everyone was happy. The guides were patient and made sure we understood all the rituals properly. Will definitely book again!',
                package: 'Umrah Family Package'
              },
              {
                name: 'Maryam Tan',
                location: 'Singapore',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
                review: 'Excellent service from start to finish. The 24/7 support was very helpful and they responded quickly to all our queries. Highly professional team!',
                package: 'Hajj Standard Package'
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  "{testimonial.review}"
                </p>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-green-600 font-semibold">
                    📦 {testimonial.package}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
                <p className="text-gray-600">Happy Pilgrims</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">4.9/5</div>
                <p className="text-gray-600">Average Rating</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
                <p className="text-gray-600">Years Experience</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <p className="text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Book your Umrah or Hajj package today and experience the trip of a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('category', { category: 'umrah-packages' })}
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
              Browse Packages
            </button>
            <button 
              onClick={() => navigate('portal')}
              className="bg-green-800 hover:bg-green-900 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.jpeg" alt="Logo" className="h-16 mb-4" />
              <p className="text-gray-400 text-sm">
                Your trusted partner for Umrah and Hajj journeys since 2010
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('category', { category: 'umrah-packages' })} className="hover:text-white">Umrah Packages</button></li>
                <li><button onClick={() => navigate('category', { category: 'hajj-packages' })} className="hover:text-white">Hajj Packages</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-white">Travel Shop</button></li>
                <li><button onClick={() => navigate('portal')} className="hover:text-white">My Bookings</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📧 enquiry@tmfouzy.sg</li>
                <li>📞 +65 6294 8044</li>
                <li>💬 WhatsApp: +65 9820 1134</li>
                <li>🏢 390 Victoria St #03-15, Singapore 188061</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <button onClick={() => window.open('https://facebook.com', '_blank')} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">f</button>
                <button onClick={() => window.open('https://linkedin.com', '_blank')} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">in</button>
                <button onClick={() => window.open('https://instagram.com', '_blank')} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">ig</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 Umrah Agency. All rights reserved. | UEN: 199402129H</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
