import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import Header from '../../components/Header';
import { fetchRestaurntReviewsByEmail, getRestaurantRating } from '../../Function/RestaurantFunctions';
import { UserDetails } from '../../Function/UserFunction';

const ReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurant = location.state?.restaurant;
  const [reviews, setReviews] = useState([]);
  const [reviewersData, setReviewersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState(null);

  useEffect(() => {
    const loadAvg = async () => {
      try {
        if (!restaurant?.id) { setAvg(null); return; }
        const value = await getRestaurantRating(restaurant.id);
        setAvg(value);
      } catch (e) {
        console.error('Failed to load rating', e);
        setAvg(0);
      }
    };
    loadAvg();
  }, [restaurant?.id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!restaurant?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const reviewData = await fetchRestaurntReviewsByEmail(restaurant.id);
        console.log(reviewData);
        const reviewList = Array.isArray(reviewData) ? reviewData : [];
        setReviews(reviewList);

        // Fetch reviewer details for each review
        const reviewersMap = {};
        await Promise.all(
          reviewList.map(async (review) => {
            if (review.customerEmail) {
              try {
                reviewersMap[review.customerEmail] = await UserDetails(review.customerEmail);
              } catch (error) {
                console.error(`Error fetching details for ${review.customerEmail}:`, error);
              }
            }
          })
        );
        setReviewersData(reviewersMap);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [restaurant?.id]);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen text-lg text-red-500">
          Restaurant not found
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen text-lg text-gray-500">
          Loading reviews...
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header />

      {/* Restaurant Header with Background Image */}
      <div className="relative h-64 overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 z-20 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        {/* Background Image */}
        <img
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex items-center gap-4">
          {/* Profile Image */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            <img
              src={restaurant.logoUrl || restaurant.coverImageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Restaurant Name and Rating */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{restaurant.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">★</span>
              <span className="text-white font-semibold">{avg}</span>
              <span className="text-white/80 text-sm">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="px-5 py-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => {
            const reviewer = reviewersData[review.customerEmail];
            const reviewerName = reviewer?.first_name || 'Anonymous';
            const reviewerImage = reviewer?.img_url || 'https://via.placeholder.com/150';

            // Generate a consistent color based on index
            const borderColors = [
              'border-l-orange-400 border-b-orange-400',
              'border-l-pink-400 border-b-pink-400',
              'border-l-purple-400 border-b-purple-400',
              'border-l-blue-400 border-b-blue-400',
              'border-l-green-400 border-b-green-400',
              'border-l-yellow-400 border-b-yellow-400',
            ];
            const borderColor = borderColors[index % borderColors.length];

            return (
              <div
                key={review.id || index}
                className={`bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-b-4 ${borderColor} relative`}
              >
                {/* Horizontal Layout: Profile Image on Left, Content on Right */}
                <div className="flex gap-4">
                  {/* Reviewer Profile Image - Left Side */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full overflow-hidden border-3 ${borderColor} shadow-md`}>
                      <img
                        src={reviewerImage}
                        alt={reviewerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content on Right Side */}
                  <div className="flex-1">
                    {/* Reviewer Name */}
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {reviewerName}
                    </h3>

                    {/* Star Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(review.rate)}
                    </div>

                    {/* Review Text */}
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "{review.review}"
                    </p>
                  </div>
                </div>

                {/* Decorative Quote Icon - Top Right Corner */}
                <div className="absolute top-4 right-4 text-gray-200 text-4xl leading-none">
                  "
                </div>
              </div>
            );
          })}
        </div>

        {/* No Reviews Message */}
        {reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
