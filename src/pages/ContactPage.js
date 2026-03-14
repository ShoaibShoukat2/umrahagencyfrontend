import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const ContactPage = ({ navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Send to backend API
    fetch('https://Tmfauwaz.pythonanywhere.com/api/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Contact form submitted:', data);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }, 5000);
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your message. Please try again.');
    });
  };

  return (
    <div className="bg-white">
      <Navbar navigate={navigate} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            We're here to help you plan your spiritual journey
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📞</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600 mb-2">+65 6294 8044</p>
                <p className="text-sm text-gray-500">Mon-Fri: 9AM - 6PM</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-2">enquiry@tmfouzy.sg</p>
                <p className="text-sm text-gray-500">We reply within 24 hours</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-2">+65 9820 1134</p>
                <p className="text-sm text-gray-500">Available 24/7</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Office</h3>
                <p className="text-gray-600 mb-2">390 Victoria St #03-15</p>
                <p className="text-gray-600">Singapore 188061</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                
                {submitted && (
                  <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+65 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Subject *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="">Select a subject</option>
                        <option value="umrah">Umrah Package Inquiry</option>
                        <option value="hajj">Hajj Package Inquiry</option>
                        <option value="booking">Booking Assistance</option>
                        <option value="general">General Question</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us how we can help you..."></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-xl text-gray-600">We'd love to meet you in person</p>
          </div>
          
          <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-lg h-96">
            {/* Placeholder for map - you can integrate Google Maps here */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🗺️</span>
                <p className="text-gray-700 font-semibold">Map Integration</p>
                <p className="text-gray-600 text-sm">390 Victoria St #03-15, Singapore 188061</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What documents do I need for Umrah?',
                a: 'You will need a valid passport (minimum 6 months validity), passport-sized photos, and vaccination certificates. We will guide you through the entire documentation process.'
              },
              {
                q: 'How far in advance should I book?',
                a: 'We recommend booking at least 2-3 months in advance to secure the best rates and availability, especially during peak seasons.'
              },
              {
                q: 'What is included in the package price?',
                a: 'Our packages typically include flights, accommodation, transportation, visa processing, and guided tours. Specific inclusions vary by package.'
              },
              {
                q: 'Do you offer group discounts?',
                a: 'Yes! We offer special rates for groups of 10 or more. Contact us for a customized quote.'
              },
              {
                q: 'What is your cancellation policy?',
                a: 'Cancellation policies vary by package and timing. Please refer to our terms and conditions or contact us for specific details.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Browse our packages and book your spiritual journey today
          </p>
          <button 
            onClick={() => navigate('category', { category: 'umrah-packages' })}
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
            View Packages
          </button>
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

export default ContactPage;
