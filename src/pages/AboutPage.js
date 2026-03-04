import React from 'react';
import Navbar from '../components/Navbar';

const AboutPage = ({ navigate }) => {
  return (
    <div className="bg-white">
      <Navbar navigate={navigate} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Us</h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Your trusted partner for spiritual journeys since 2010
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Founded in 2010, our agency has been dedicated to providing exceptional Umrah and Hajj experiences for pilgrims from around the world. What started as a small family business has grown into one of the most trusted names in Islamic travel.
              </p>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                We understand that performing Umrah or Hajj is a once-in-a-lifetime experience for many. That's why we've made it our mission to ensure every aspect of your journey is handled with care, professionalism, and deep respect for the spiritual significance of your pilgrimage.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Over the years, we've helped more than 10,000 pilgrims fulfill their spiritual obligations, and we continue to innovate and improve our services to meet the evolving needs of modern travelers.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=600&fit=crop" 
                alt="Kaaba" 
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide seamless, affordable, and spiritually enriching pilgrimage experiences that allow our clients to focus entirely on their worship and spiritual growth, while we handle all the logistics and details.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">👁️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the world's most trusted and preferred Islamic travel agency, known for our exceptional service, integrity, and commitment to making the sacred journey accessible to all Muslims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-600">
                We operate with complete transparency and honesty in all our dealings
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest quality in every service we provide
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compassion</h3>
              <p className="text-gray-600">
                We treat every pilgrim with care, respect, and understanding
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-green-100">Happy Pilgrims</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">15+</div>
              <div className="text-green-100">Years Experience</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-green-100">Packages Available</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9★</div>
              <div className="text-green-100">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">Experienced professionals dedicated to your journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ahmad Abdullah', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
              { name: 'Fatima Hassan', role: 'Operations Director', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
              { name: 'Ibrahim Khan', role: 'Customer Relations', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <img src={member.image} alt={member.name} className="w-full h-80 object-cover" />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-green-600 font-semibold">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Licensed & Certified</h2>
            <p className="text-xl text-gray-600">Fully authorized and regulated</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Government Licensed</h3>
              <p className="text-gray-600">UEN: 199402129H</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Industry Certified</h3>
              <p className="text-gray-600">Member of Travel Agents Association</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Insured & Protected</h3>
              <p className="text-gray-600">Full travel insurance coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied pilgrims who trusted us with their sacred journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('category', { category: 'umrah-packages' })}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
              Browse Packages
            </button>
            <button 
              onClick={() => navigate('contact')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all">
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
                <li><button onClick={() => navigate('landing')} className="hover:text-white">Home</button></li>
                <li><button onClick={() => navigate('about')} className="hover:text-white">About Us</button></li>
                <li><button onClick={() => navigate('category', { category: 'umrah-packages' })} className="hover:text-white">Umrah Packages</button></li>
                <li><button onClick={() => navigate('contact')} className="hover:text-white">Contact</button></li>
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
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">f</a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">in</a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">ig</a>
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

export default AboutPage;
