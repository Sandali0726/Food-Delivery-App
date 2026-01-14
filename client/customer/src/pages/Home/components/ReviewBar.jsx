import React, { useState, useEffect } from 'react';
import { getAllReviews } from '../../../Function/OrderFunction';
import { UserDetails } from '../../../Function/UserFunction';
import { getRestaurantDetails } from '../../../Function/RestaurantFunctions';

const ReviewBar = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewersData, setReviewersData] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getAllReviews();
        // Filter reviews that have valid data
        const validReviews = Array.isArray(data)
          ? data.filter(
              (review) =>
                review && review.review && review.rate > 0 && review.customerEmail && review.restaurantEmail
            )
          : [];
        setReviews(validReviews);

        // Prepare unique email lists for customers and restaurants
        const customerEmails = [...new Set(validReviews.map((r) => r.customerEmail).filter(Boolean))];
        const restaurantEmails = [...new Set(validReviews.map((r) => r.restaurantEmail).filter(Boolean))];
        const dataMap = {};

        // Fetch user and restaurant details in parallel
        await Promise.all([
          Promise.all(
            customerEmails.map(async (email) => {
              try {
                const user = await UserDetails(email);
                if (user) dataMap[email] = user;
              } catch (err) {
                console.error(`Failed to fetch user data for ${email}`, err);
              }
            })
          ),
          Promise.all(
            restaurantEmails.map(async (email) => {
              try {
                const restaurant = await getRestaurantDetails(email);
                if (restaurant) dataMap[email] = restaurant;
              } catch (err) {
                console.error(`Failed to fetch restaurant data for ${email}`, err);
              }
            })
          ),
        ]);

        setReviewersData(dataMap);
      } catch (e) {
        console.error('Failed to fetch reviews:', e);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-rotate reviews every 10 seconds
  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl shadow-md p-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 bg-orange-200 rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-orange-200 rounded w-3/4"></div>
              <div className="h-4 bg-orange-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reviews.length) {
    return null;
  }

  const currentReview = reviews[currentIndex];
  const reviewer = reviewersData[currentReview?.customerEmail] || {};
  const restaurant = reviewersData[currentReview?.restaurantEmail] || {};
  const reviewerName = reviewer.first_name;
  const reviewerImg = reviewer.img_url;
  const restaurantName = restaurant.name;
  const restaurantProfileImg = restaurant.profileImageUrl;
  const restaurantCoverImg = restaurant.coverImageUrl;

  return (
    <div className="max-w-5xl mx-auto rounded-xl shadow-lg overflow-hidden">
      {/* Background Image Container */}
      <div className="relative h-64 md:h-80">
        {/* Cover Image as Background */}
        {restaurantCoverImg ? (
          <img
            src={restaurantCoverImg}
            alt={restaurantName || 'Restaurant'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-400 to-yellow-400"></div>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
          {/* Top Section - Restaurant Info */}
          <div className="flex items-center gap-4">
            {/* Restaurant Profile Image */}
            {restaurantProfileImg ? (
              <img
                src={restaurantProfileImg}
                alt={restaurantName || 'Restaurant'}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-3xl md:text-4xl">🍽️</span>
              </div>
            )}

            {/* Restaurant Name */}
            {restaurantName && (
              <div>
                <h3 className="text-white font-bold text-xl md:text-2xl drop-shadow-lg">
                  {restaurantName}
                </h3>
              </div>
            )}
          </div>

          {/* Bottom Section - Review Content */}
          <div className="space-y-4 ">
            {/* Review Text */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-5 border border-white/20 pl-21">
              <p className="text-white text-base md:text-lg leading-relaxed italic">
                "{currentReview.review}"
              </p>
            </div>

            {/* Reviewer Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {reviewerImg ? (
                  <img
                    src={reviewerImg}
                    alt={reviewerName || 'Reviewer'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-orange-500 font-bold text-lg border-2 border-white shadow-md">
                    {reviewerName ? reviewerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white drop-shadow-md">
                    {reviewerName || 'Customer'}
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg drop-shadow-md ${
                          i < (currentReview.rate || 0) ? 'text-yellow-400' : 'text-white/40'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewBar;
