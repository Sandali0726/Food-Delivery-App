import React from 'react';
import RatingModalBase from './RatingModalBase';
import foodDeliveryMan from '../../../assets/food-delivery-man.jpg';

const RiderReviewModal = ({ isOpen, onClose, deliveryPerson, onSubmitReview, Email, orderId }) => {
  //console.log('RiderReviewModal deliveryPerson:', deliveryPerson);
  const handleSubmitReview = async ({ rate, review }) => {
    await onSubmitReview({
      rate,
      review,
      riderEmail: Email,
      customerEmail: localStorage.getItem('userEmail'),
      orderId: orderId,
    });
  };

  const deliveryPersonInfo = (
    <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="text-xl">
          <img
            src={foodDeliveryMan}
            alt={deliveryPerson.rider_name}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        </span>
      </div>
      <div>
        <p className="font-semibold text-gray-800">
          {deliveryPerson.rider_name || 'Delivery Person'}
        </p>
        <p className="text-sm text-gray-500">How was your delivery?</p>
      </div>
    </div>
  );

  return (
    <RatingModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Delivery"
      targetInfo={deliveryPersonInfo}
      onSubmitReview={handleSubmitReview}
      placeholderText="Share your experience with this delivery person..."
    />
  );
};

export default RiderReviewModal;
