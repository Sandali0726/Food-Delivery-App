import { ChefHat, Users, Award, Heart } from 'lucide-react';
import backgroundImage from '../assets/background.jpg';

function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
        <img 
          src={backgroundImage} 
          alt="About Us" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white font-['Impact'] text-5xl tracking-[0.4em]">ABOUT US</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Mission Section */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            At Yumy, we're passionate about connecting restaurants with their customers through seamless delivery experiences. 
            Our platform empowers restaurant partners to manage their orders efficiently while providing customers with 
            delicious meals delivered right to their doorstep.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We believe in supporting local businesses and creating opportunities for delivery partners, all while 
            ensuring the highest standards of food quality and customer service.
          </p>
        </section>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Community First</h3>
            <p className="text-gray-600 text-sm">
              We prioritize building strong relationships with our restaurant partners, delivery riders, and customers.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Excellence</h3>
            <p className="text-gray-600 text-sm">
              We strive for excellence in every delivery, ensuring quality food reaches customers fresh and on time.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Passion</h3>
            <p className="text-gray-600 text-sm">
              We're passionate about food and technology, bringing the two together to create amazing experiences.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Founded in 2024, Yumy started with a simple idea: make restaurant delivery management effortless. 
            What began as a small project has grown into a comprehensive platform serving restaurants across the region.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Today, we're proud to partner with hundreds of restaurants, support a growing network of delivery riders, 
            and serve thousands of satisfied customers every day.
          </p>
          <p className="text-gray-600 leading-relaxed">
            As we continue to grow, our commitment remains the same: to provide the best delivery experience 
            for everyone involved in the journey from kitchen to doorstep.
          </p>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;
