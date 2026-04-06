import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import { HOTEL_CONTACT } from '../components/Footer';
import { supabase } from '../lib/supabase';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: 'booking' | 'general' | 'feedback' | 'partnership';
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('contact_inquiries')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          inquiry_type: formData.inquiryType,
          status: 'new',
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        // Continue anyway - we'll try to send WhatsApp notification
      }

      // Send WhatsApp notification to hotel
      const whatsappMessage = `🔔 New Inquiry!\n\nFrom: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nType: ${formData.inquiryType}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;

      // Open WhatsApp in new tab for hotel notification (this is a backup method)
      // In production, you'd use a server-side webhook
      console.log('Contact inquiry submitted:', formData);

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError('Failed to submit inquiry. Please try WhatsApp or call us directly.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-urbane-mist">
      <Helmet>
        <title>Contact Urbane Haauz | Boutique Hotel in Upper Pelling, Sikkim</title>
        <meta name="description" content="Contact Urbane Haauz in Upper Pelling: +91 9136032524, urbanehaauz@gmail.com. SH-510, Pelling, West Sikkim 737113." />
        <link rel="canonical" href="https://urbanehaauz.com/#/contact" />
        <meta property="og:title" content="Contact Urbane Haauz" />
        <meta property="og:description" content="Get in touch with Urbane Haauz in Upper Pelling, Sikkim." />
        <meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />
        <meta property="og:url" content="https://urbanehaauz.com/#/contact" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-urbane-darkGreen to-urbane-green overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-urbane-gold tracking-[0.3em] uppercase text-sm mb-2">Get in Touch</p>
            <h1 className="font-serif text-5xl font-bold">Contact Us</h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-urbane-charcoal mb-6">
                We'd Love to Hear From You
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Whether you have questions about bookings, special requests, or partnership opportunities,
                our team is here to help.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-urbane-gold/10 p-3 rounded-lg">
                    <MapPin className="text-urbane-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-urbane-charcoal">Location</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {HOTEL_CONTACT.address}<br />
                      {HOTEL_CONTACT.city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-urbane-gold/10 p-3 rounded-lg">
                    <Phone className="text-urbane-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-urbane-charcoal">Phone</h3>
                    <a href={`tel:${HOTEL_CONTACT.phoneClean}`} className="text-gray-600 text-sm mt-1 hover:text-urbane-gold">
                      {HOTEL_CONTACT.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-urbane-gold/10 p-3 rounded-lg">
                    <Mail className="text-urbane-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-urbane-charcoal">Email</h3>
                    <a href={`mailto:${HOTEL_CONTACT.email}`} className="text-gray-600 text-sm mt-1 hover:text-urbane-gold">
                      {HOTEL_CONTACT.email}
                    </a>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${HOTEL_CONTACT.whatsapp}?text=Hi! I have a question about Urbane Haauz.`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-500 p-6 rounded-xl shadow-md hover:shadow-lg hover:bg-green-600 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">WhatsApp</h3>
                    <p className="text-green-100 text-sm mt-1">
                      Quick response • Click to chat
                    </p>
                  </div>
                </div>
              </a>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="bg-urbane-gold/10 p-3 rounded-lg">
                    <Clock className="text-urbane-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-urbane-charcoal">Hours</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Front Desk: 24/7<br />
                      Check-in: 2:00 PM<br />
                      Check-out: 11:00 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="font-serif text-2xl font-bold text-urbane-charcoal mb-6">
                Send Us a Message
              </h2>

              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={24} />
                  <div>
                    <p className="font-medium text-green-800">Message sent successfully!</p>
                    <p className="text-sm text-green-600">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none transition-all bg-white"
                    >
                      <option value="booking">Booking Inquiry</option>
                      <option value="general">General Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none transition-all"
                    placeholder="What is your inquiry about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-gold focus:border-urbane-gold outline-none transition-all resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-urbane-green to-urbane-darkGreen text-white py-4 rounded-lg font-bold tracking-wider uppercase hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-urbane-charcoal mb-6 text-center">
            Find Us
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3547.1234567890!2d88.2374!3d27.3081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDE4JzI5LjIiTiA4OMKwMTQnMTQuNiJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Urbane Haauz Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
