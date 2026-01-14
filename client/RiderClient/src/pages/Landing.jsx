import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdDeliveryDining, MdAttachMoney, MdSchedule, MdLocationOn, MdTrendingUp, MdStar, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { FaMotorcycle, FaBicycle, FaCar } from 'react-icons/fa';
import deliveryGif from '../assets/Online Delivery Service.gif';
import heroImg1 from '../assets/image 6.png';
import heroImg2 from '../assets/image 7.png';
import heroImg3 from '../assets/image 8.png';
import heroImg4 from '../assets/image 9.png';
import heroImg5 from '../assets/image 5.png';
import logo from '../assets/logo.png';

const Landing = () => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4, heroImg5];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: <MdAttachMoney className="text-5xl text-yellow-400" />,
            title: "Earn More",
            description: "Competitive earnings with bonuses and incentives for peak hours"
        },
        {
            icon: <MdSchedule className="text-5xl text-orange-400" />,
            title: "Flexible Schedule",
            description: "Work when you want, choose your own hours and be your own boss"
        },
        {
            icon: <MdLocationOn className="text-5xl text-yellow-400" />,
            title: "Smart Routes",
            description: "AI-powered routing system to optimize your deliveries and save time"
        },
        {
            icon: <MdTrendingUp className="text-5xl text-orange-400" />,
            title: "Growth Potential",
            description: "Unlock premium perks and higher earnings as you complete more deliveries"
        }
    ];

    const stats = [
        { number: "5000+", label: "Active Riders" },
        { number: "50K+", label: "Monthly Deliveries" },
        { number: "4.8★", label: "Average Rating" },
        { number: "$40K+", label: "Avg Monthly Earnings" }
    ];

    const benefits = [
        "Weekly payouts directly to your account",
        "Insurance coverage for all deliveries",
        "24/7 rider support and assistance",
        "Fuel and maintenance bonuses",
        "Exclusive rider community events",
        "Performance-based incentives"
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <img src={logo} alt="Yumy Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
                            <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                                Yumy Riders
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Link 
                                to="/login"
                                className="px-3 sm:px-6 py-2 text-sm sm:text-base text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register"
                                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[600px] sm:min-h-[700px]">
                {/* Animated Background Images */}
                <div className="absolute inset-0 z-0">
                    {heroImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img
                                src={img}
                                alt={`Background ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    {/* Gradient Overlays for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center justify-start">
                        {/* Center Content */}
                        <div className="max-w-4xl space-y-4 sm:space-y-6 lg:space-y-8 animate-slide-in-left text-left">
                            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                </span>
                                <span className="text-sm font-semibold text-orange-600">Now Hiring in Your Area!</span>
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                                Deliver With
                                <span className="block bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                    Freedom & Flexibility
                                </span>
                            </h1>
                            
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white drop-shadow-lg">
                                Turn your free time into earnings. Join Yumy's growing community of riders and start making money on your own schedule.
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-start">
                                <Link 
                                    to="/register"
                                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full font-bold text-base sm:text-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
                                >
                                    <span>Start Earning Today</span>
                                    <MdArrowForward className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link 
                                    to="/login"
                                    className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-all backdrop-blur-sm text-center"
                                >
                                    Already a Rider? Login
                                </Link>
                            </div>

                            {/* Vehicle Icons */}
                            <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 lg:gap-6 pt-4">
                                <div className="flex items-center space-x-1 sm:space-x-2 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg">
                                    <FaMotorcycle className="text-xl sm:text-2xl text-orange-500" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Bike</span>
                                </div>
                                <div className="flex items-center space-x-1 sm:space-x-2 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg">
                                    <FaBicycle className="text-xl sm:text-2xl text-yellow-500" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Bicycle</span>
                                </div>
                                <div className="flex items-center space-x-1 sm:space-x-2 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg">
                                    <FaCar className="text-xl sm:text-2xl text-orange-500" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Car</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 sm:py-16 bg-gradient-to-r from-orange-500 to-yellow-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">{stat.number}</div>
                                <div className="text-xs sm:text-sm md:text-base text-white/90 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                            Why Ride With <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Yumy?</span>
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                            Join thousands of riders who trust Yumy for their delivery business
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                        {/* Left - Image */}
                        <div className="relative">
                            <img 
                                src={deliveryGif}
                                alt="Delivery service"
                                className="rounded-3xl shadow-2xl w-full"
                            />
                        </div>

                        {/* Right - Benefits List */}
                        <div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                                Exclusive <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Rider Benefits</span>
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
                                We care about our riders. That's why we offer comprehensive benefits to support your success.
                            </p>
                            
                            <div className="space-y-3 sm:space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                                        <MdCheckCircle className="text-xl sm:text-2xl text-green-500 flex-shrink-0 mt-1" />
                                        <span className="text-gray-700 text-sm sm:text-base lg:text-lg">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <Link 
                                to="/register"
                                className="inline-flex items-center justify-center space-x-2 mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full font-bold text-base sm:text-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-xl w-full sm:w-auto"
                            >
                                <span>Join Our Rider Network</span>
                                <MdArrowForward className="text-lg sm:text-xl" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4">
                            Get Started in <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">3 Simple Steps</span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="relative text-center p-6 sm:p-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                1
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Sign Up</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Create your account in minutes with just your basic details and vehicle information
                            </p>
                            {/* Connecting Line */}
                            <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-1 bg-gradient-to-r from-orange-300 to-yellow-300"></div>
                        </div>

                        <div className="relative text-center p-6 sm:p-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                2
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Get Verified</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Quick verification process to ensure safety for everyone on the platform
                            </p>
                            {/* Connecting Line */}
                            <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-1 bg-gradient-to-r from-orange-300 to-yellow-300"></div>
                        </div>

                        <div className="text-center p-6 sm:p-8 sm:col-span-2 md:col-span-1">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                3
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Start Earning</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Accept deliveries, earn money, and enjoy the freedom of being your own boss
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-yellow-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 px-4">
                        Join our community of successful riders and take control of your earnings
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Link 
                            to="/register"
                            className="group px-8 sm:px-10 py-4 sm:py-5 bg-white text-orange-500 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
                        >
                            <span>Sign Up Now</span>
                            <MdArrowForward className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            to="/login"
                            className="px-8 sm:px-10 py-4 sm:py-5 border-2 border-white text-white rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
                        >
                            Login to Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                                <img src={logo} alt="Yumy Logo" className="h-6 sm:h-8 w-6 sm:w-8 object-contain" />
                                <span className="text-lg sm:text-xl font-bold">Yumy Riders</span>
                            </div>
                            <p className="text-sm sm:text-base text-gray-400">
                                Your trusted partner in food delivery services
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                                <li><Link to="/register" className="hover:text-orange-500 transition-colors">Become a Rider</Link></li>
                                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Login</Link></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Help Center</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
                            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">FAQs</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Safety</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
                            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400">
                        <p className="text-xs sm:text-sm">&copy; 2026 Yumy Riders. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
