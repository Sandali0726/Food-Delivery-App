import React from 'react';
import RatingModalBase from './RatingModalBase';
import restReviewVideo from '../../../assets/restReview.mp4';

const RestaurantReviewModal = ({ isOpen, onClose, restaurant, onSubmitReview }) => {
  //console.log('RestaurantReviewModal restaurant:', restaurant);
  const handleSubmitReview = async ({ rate, review }) => {
    await onSubmitReview({
      rate,
      review,
      customerEmail: localStorage.getItem('userEmail'),
    });
  };

  const restaurantInfo = (
    <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
        {/* Replace emoji icon with video preview */}
        <video
          src={restReviewVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-20 h-20 object-cover"
        />
      </div>
      <div>
        <p className="font-semibold text-gray-800">
          {restaurant.name || 'Restaurant'}
        </p>
        <p className="text-sm text-gray-500">How was your experience?</p>
      </div>
    </div>
  );

  return (
    <RatingModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Restaurant"
      targetInfo={restaurantInfo}
      onSubmitReview={handleSubmitReview}
      placeholderText="Share your experience with this restaurant..."
    />
  );
};

export default RestaurantReviewModal;
