import { FileText, Shield, AlertCircle } from 'lucide-react';
import backgroundImage from '../assets/background.jpg';

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
        <img 
          src={backgroundImage} 
          alt="Terms of Service" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white font-['Impact'] text-4xl tracking-[0.4em]">TERMS OF SERVICE</h1>
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
            <FileText className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Introduction</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Yumy. These Terms of Service ("Terms") govern your use of our restaurant delivery management 
            platform and services. By accessing or using Yumy, you agree to be bound by these Terms. Please read them carefully.
          </p>
        </section>

        {/* Terms Sections */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              By creating an account and using Yumy's services, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you do not agree to these Terms, you may not access or use our services.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">2. Restaurant Partner Obligations</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Maintain accurate and up-to-date restaurant information</li>
              <li>Ensure food quality and safety standards are met</li>
              <li>Process orders promptly and accurately</li>
              <li>Comply with all applicable local health and safety regulations</li>
              <li>Maintain appropriate business licenses and permits</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">3. Order Management</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Restaurant partners are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Confirming orders within a reasonable timeframe</li>
              <li>Preparing orders according to customer specifications</li>
              <li>Coordinating with delivery riders for timely pickup</li>
              <li>Handling order modifications and cancellations appropriately</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">4. Payment Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Payment processing is handled through our platform. Restaurant partners agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Accept platform service fees as outlined in your agreement</li>
              <li>Receive payments according to the agreed schedule</li>
              <li>Report any payment discrepancies within 30 days</li>
            </ul>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content, trademarks, and intellectual property on the Yumy platform remain the property of 
              their respective owners. Restaurant partners retain rights to their menu items, photos, and branding, 
              but grant Yumy a license to display this content on the platform.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Yumy provides the platform "as is" and is not liable for indirect, incidental, or consequential damages. 
              Our total liability is limited to the fees paid by you in the preceding 12 months.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">7. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              Either party may terminate this agreement with 30 days written notice. Yumy reserves the right to 
              immediately suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms from time to time. Continued use of the platform after changes are posted 
              constitutes acceptance of the updated Terms.
            </p>
          </section>
        </div>

        {/* Contact */}
        <section className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">Questions?</h2>
          </div>
          <p className="text-gray-600">
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@yumy.com" className="text-orange-600 hover:text-orange-700 font-medium">
              legal@yumy.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;
