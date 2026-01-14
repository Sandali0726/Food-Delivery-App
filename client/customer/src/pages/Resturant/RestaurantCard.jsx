import React, { useEffect, useState } from 'react';
import { getRestaurantRating } from '../../Function/RestaurantFunctions';
import { StarIcon } from '@heroicons/react/24/solid';

const RestaurantCard = ({ restaurant, onClick }) => {
  const [avg, setAvg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!restaurant?.id) { setAvg(null); return; }
        const value = await getRestaurantRating(restaurant.id);
        setAvg(value);
      } catch (e) {
        console.error('Failed to load rating', e);
        setAvg(0);
      }
    };
    load();
  }, [restaurant?.id]);

  return (
      <div
          onClick={onClick}
          className="relative h-72 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        {/* Cover Image */}
        <img
            src={restaurant.coverImageUrl || 'https://via.placeholder.com/400x400?text=Restaurant'}
            alt={`${restaurant.name} cover`}
            className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-lg font-bold text-white mb-1">
            {restaurant.name}
          </h3>

          <div className="flex justify-between items-center">
            {/* Open / Closed */}
            <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    restaurant.open
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                }`}
            >
        {restaurant.open ? 'Open' : 'Closed'}
      </span>

            {/* Rating */}
            <div className="flex items-center gap-1 text-white text-sm">
                <StarIcon className="w-4 h-4 text-yellow-400" />
              <span>{avg}</span>
            </div>
          </div>
        </div>
      </div>

  );
};

export default RestaurantCard;
