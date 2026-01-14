import { Shield, Lock, Eye, Database, AlertCircle } from 'lucide-react';
import backgroundImage from '../assets/background.jpg';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
        <img 
          src={backgroundImage} 
          alt="Privacy Policy" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white font-['Impact'] text-4xl tracking-[0.4em]">PRIVACY POLICY</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Last Updated */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Last Updated: January 5, 2026</span>
          </div>
        </div>

        {/* Introduction */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Our Commitment to Privacy</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            At Yumy, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our restaurant delivery management platform.
          </p>
        </section>

        {/* Privacy Sections */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">1. Information We Collect</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">We collect several types of information:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, restaurant details</li>
              <li><strong>Business Information:</strong> Restaurant location, menu items, pricing, operating hours</li>
              <li><strong>Order Data:</strong> Order details, customer information, delivery addresses</li>
              <li><strong>Usage Data:</strong> How you interact with our platform, features used, login times</li>
              <li><strong>Payment Information:</strong> Banking details for payment processing (securely encrypted)</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">2. How We Use Your Information</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide and maintain our delivery management services</li>
              <li>Process orders and coordinate deliveries</li>
              <li>Send you important updates about your account and orders</li>
              <li>Improve our platform and develop new features</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Delivery Partners:</strong> Name and order details to facilitate deliveries</li>
              <li><strong>Customers:</strong> Restaurant information and order status</li>
              <li><strong>Service Providers:</strong> Payment processors, hosting services, analytics tools</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">4. Data Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure servers and regular security audits</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular backups and disaster recovery procedures</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Maintain your session and keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized experiences</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. 
              Order data is typically retained for 7 years for accounting and legal purposes. You may request deletion 
              of your account data at any time, subject to legal retention requirements.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
              personal information from children.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>
        </div>

        {/* Contact */}
        <section className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong>{' '}
              <a href="mailto:privacy@yumy.com" className="text-orange-600 hover:text-orange-700">
                privacy@yumy.com
              </a>
            </p>
            <p><strong>Phone:</strong> +1 (234) 567-890</p>
            <p><strong>Address:</strong> Yumy Privacy Team, 123 Food Street, Culinary City, CC 12345</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
