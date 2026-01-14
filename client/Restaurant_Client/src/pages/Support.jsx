import { Mail, Phone, MessageCircle, HelpCircle, FileText, Users } from 'lucide-react';
import backgroundImage from '../assets/background.jpg';

function Support() {
  const faqs = [
    {
      question: "How do I update my restaurant menu?",
      answer: "Navigate to the Menu page from the dashboard. You can add, edit, or remove items directly from there."
    },
    {
      question: "How do I track my orders?",
      answer: "Go to the Orders page to see all your current and past orders. Click on any order to view detailed information."
    },
    {
      question: "How do I manage delivery assignments?",
      answer: "Visit the Deliver Now page to see all active deliveries and assign riders to pending orders."
    },
    {
      question: "How can I update my restaurant profile?",
      answer: "Access the Settings page to update your restaurant information, contact details, and preferences."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
        <img 
          src={backgroundImage} 
          alt="Support" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white font-['Impact'] text-5xl tracking-[0.4em]">SUPPORT</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-3">Get help via email</p>
            <a href="mailto:support@yumy.com" className="text-orange-600 hover:text-orange-700 font-medium">
              support@yumy.com
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Phone Support</h3>
            <p className="text-gray-600 text-sm mb-3">Call us directly</p>
            <a href="tel:+1234567890" className="text-orange-600 hover:text-orange-700 font-medium">
              +1 (234) 567-890
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-3">Chat with our team</p>
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Start Chat
            </button>
          </div>
        </div>

        {/* FAQs */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Help Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-800">Documentation</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Browse our comprehensive guides and tutorials to get the most out of Yumy.
            </p>
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              View Docs →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-800">Community Forum</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Connect with other restaurant partners and share experiences.
            </p>
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Join Forum →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
