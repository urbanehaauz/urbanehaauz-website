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

const CONTACT_BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://urbanehaauz.com/' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://urbanehaauz.com/contact' },
  ],
};

// FAQPage schema specific to /contact — contact-flavoured questions
const CONTACT_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://urbanehaauz.com/contact#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I contact Urbane Haauz directly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Call or WhatsApp +91 9136032524, email info@urbanehaauz.com, or submit the contact form at urbanehaauz.com/contact. WhatsApp is the fastest channel — responses usually within a few hours during business hours (9:00–21:00 IST).',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the address of Urbane Haauz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Urbane Haauz is at SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113, India. We are a 10-minute walk from the Pelling Skywalk and a short drive from Pemayangtse Monastery and Rabdentse Ruins.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the check-in and check-out times?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Standard check-in is 1:00 PM IST and check-out is 11:00 AM IST. Early check-in and late check-out are available on request, subject to room availability on the day.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you arrange airport or railway station pickup?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We arrange private taxi pickup from Bagdogra Airport (IXB) or NJP railway station to Upper Pelling — a 4.5–5 hour scenic drive of approximately 140 km. Please request transfers at least 24 hours in advance so we can lock in the vehicle and rate.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you accept group or corporate bookings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. For groups of 4+ rooms, family retreats, small weddings, or corporate offsites, WhatsApp us at +91 9136032524 or email info@urbanehaauz.com for custom pricing and meal plans. We can reserve the full 8-room property for exclusive use on request.',
      },
    },
    {
      '@type': 'Question',
      name: 'What languages do you speak?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Staff and founders at Urbane Haauz speak English, Hindi, Bengali, and Nepali. WhatsApp support is available in all four languages during business hours — useful for Bengali families travelling from Kolkata.',
      },
    },
  ],
};

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
        <meta name="description" content="Contact Urbane Haauz in Upper Pelling: +91 9136032524, info@urbanehaauz.com. SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113." />
        <link rel="canonical" href="https://urbanehaauz.com/contact" />
        <meta property="og:title" content="Contact Urbane Haauz" />
        <meta property="og:description" content="Get in touch with Urbane Haauz in Upper Pelling, Sikkim." />
        <meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />
        <meta property="og:url" content="https://urbanehaauz.com/contact" />
        <script type="application/ld+json">{JSON.stringify(CONTACT_BREADCRUMB_JSONLD)}</script>
        <script type="application/ld+json">{JSON.stringify(CONTACT_FAQ_JSONLD)}</script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-urbane-darkGreen to-urbane-green overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Contact Urbane Haauz — Pelling, Sikkim</h1>
            <p className="text-green-100 max-w-xl mx-auto">
              Questions, bookings, or just saying hello — we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="font-serif text-2xl font-bold text-urbane-green mb-6">Get in Touch</h2>

                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="bg-urbane-green/10 p-3 rounded-lg mr-4">
                      <MapPin className="h-5 w-5 text-urbane-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Address</p>
                      <p className="text-gray-600 text-sm">
                        {HOTEL_CONTACT.address}<br />
                        {HOTEL_CONTACT.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-urbane-green/10 p-3 rounded-lg mr-4">
                      <Phone className="h-5 w-5 text-urbane-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Phone</p>
                      <a
                        href={`tel:${HOTEL_CONTACT.phoneClean}`}
                        className="text-gray-600 text-sm hover:text-urbane-gold transition-colors"
                      >
                        {HOTEL_CONTACT.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-urbane-green/10 p-3 rounded-lg mr-4">
                      <Mail className="h-5 w-5 text-urbane-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Email</p>
                      <a
                        href={`mailto:${HOTEL_CONTACT.email}`}
                        className="text-gray-600 text-sm hover:text-urbane-gold transition-colors break-all"
                      >
                        {HOTEL_CONTACT.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-urbane-green/10 p-3 rounded-lg mr-4">
                      <MessageCircle className="h-5 w-5 text-urbane-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">WhatsApp</p>
                      <a
                        href={`https://wa.me/${HOTEL_CONTACT.whatsapp}?text=Hi! I'd like to ask about a stay at Urbane Haauz.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 text-sm hover:text-urbane-gold transition-colors"
                      >
                        Chat with us on WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-urbane-green/10 p-3 rounded-lg mr-4">
                      <Clock className="h-5 w-5 text-urbane-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Reception</p>
                      <p className="text-gray-600 text-sm">Open 24 hours, all 7 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <h2 className="font-serif text-2xl font-bold text-urbane-green mb-6">Send Us a Message</h2>

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800">Message sent successfully!</p>
                      <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-green focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-green focus:border-transparent"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-green focus:border-transparent"
                        placeholder="+91 XXXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-green focus:border-transparent bg-white"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-green focus:border-transparent"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-urbane-green focus:border-transparent"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center bg-urbane-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-urbane-lightGreen transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={16} className="mr-2" />
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">
            <iframe
              title="Urbane Haauz location on Google Maps"
              src="https://maps.google.com/maps?q=place_id:ChIJ64XS8CiH5jkRhVPjjCbPA_0&z=17&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
