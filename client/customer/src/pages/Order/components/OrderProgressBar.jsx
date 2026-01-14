import React from 'react';
import { CheckIcon, ClockIcon, CheckCircleIcon, FireIcon, BellAlertIcon, TruckIcon, ShoppingBagIcon, HomeIcon } from '@heroicons/react/24/solid';
import { ORDER_STATUS_FLOW } from './OrderStatusFlow';
const statusLabel = (status) =>
    status.replace(/_/g, ' ').toLowerCase();
// Map status to icon
const getStatusIcon = (status, isCompleted, isActive) => {
    const iconClass = `${isCompleted || isActive ? 'text-white' : 'text-gray-400'}`;
    const size = 'w-4 h-4';
    switch (status) {
        case 'CONFIRM':
            return <CheckCircleIcon className={`${size} ${iconClass}`} />;
        case 'ACCEPTED':
            return <ClockIcon className={`${size} ${iconClass}`} />;
        case 'PREPARING':
            return <FireIcon className={`${size} ${iconClass}`} />;
        case 'READY':
            return <BellAlertIcon className={`${size} ${iconClass}`} />;
        case 'GO_TO_PICKUP':
            return <ShoppingBagIcon className={`${size} ${iconClass}`} />;
        case 'PICKED_UP':
            return <TruckIcon className={`${size} ${iconClass}`} />;
        case 'ON_THE_WAY':
            return <TruckIcon className={`${size} ${iconClass}`} />;
        case 'DELIVERED':
            return <HomeIcon className={`${size} ${iconClass}`} />;
        default:
            return <CheckIcon className={`${size} ${iconClass}`} />;
    }
};
const OrderProgressBar = ({ currentStatus, vertical = false }) => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(
        (currentStatus || '').toUpperCase()
    );
    if (currentIndex === -1) return null;
    // Vertical layout for detailed view
    if (vertical) {
        return (
            <div className="w-full">
                <div className="space-y-4">
                    {ORDER_STATUS_FLOW.map((status, index) => {
                        const isCompleted = index < currentIndex;
                        const isActive = index === currentIndex;
                        const circleClass = (isCompleted || isActive) ? 'bg-green-500 border-green-500' : 'bg-gray-200 border-gray-300';
                        const textClass = (isCompleted || isActive) ? 'text-green-600 font-semibold' : 'text-gray-400';
                        return (
                            <div key={status} className="relative flex items-start gap-3">
                                {/* Connector line */}
                                {index !== ORDER_STATUS_FLOW.length - 1 && (
                                    <div 
                                        className={`absolute left-4 top-8 w-0.5 h-8 ${
                                            index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                                        }`} 
                                    />
                                )}
                                {/* Circle with Icon */}
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${circleClass}`}>
                                    {getStatusIcon(status, isCompleted, isActive)}
                                </div>
                                {/* Label */}
                                <div className="flex-1 pt-1">
                                    <p className={`text-sm capitalize ${textClass}`}>
                                        {statusLabel(status)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    // Horizontal layout for order cards
    return (
        <div className="mt-3 sm:mt-4 mb-3 sm:mb-4 w-full">
            {/* Mobile (vertical) */}
            <div className="flex flex-col gap-2 sm:hidden">
                {ORDER_STATUS_FLOW.map((status, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    const circleClass = (isCompleted || isActive) ? 'bg-green-500' : 'bg-orange-400';
                    const lineClass = index < currentIndex ? 'bg-green-500' : 'bg-orange-300';
                    return (
                        <div key={status} className="flex items-center">
                            {/* Circle with Icon */}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${circleClass}`}>
                                {getStatusIcon(status, isCompleted, isActive)}
                            </div>
                            {/* Label */}
                            <div className={`ml-2 text-[11px] font-medium ${isCompleted || isActive ? 'text-green-600' : 'text-orange-500'}`}>
                                {statusLabel(status)}
                            </div>
                            {/* Vertical connector */}
                            {index !== ORDER_STATUS_FLOW.length - 1 && (
                                <div className={`ml-2 flex-1 h-px ${lineClass}`} />
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Desktop/Tablet (horizontal) */}
            <div className="hidden sm:block">
                {/* Progress bar */}
                <div className="flex items-center justify-between">
                    {ORDER_STATUS_FLOW.map((status, index) => {
                        const isCompleted = index < currentIndex;
                        const isActive = index === currentIndex;
                        return (
                            <div key={status} className="flex-1 flex items-center">
                                {/* Circle with Icon */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${isCompleted || isActive ? 'bg-green-500' : 'bg-orange-400'}`}>
                                    {getStatusIcon(status, isCompleted, isActive)}
                                </div>
                                {/* Line */}
                                {index !== ORDER_STATUS_FLOW.length - 1 && (
                                    <div className={`flex-1 h-1 ${index < currentIndex ? 'bg-green-500' : 'bg-orange-300'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
                {/* Status names */}
                <div className="flex justify-between mt-2">
                    {ORDER_STATUS_FLOW.map((status, index) => {
                        const isCompleted = index < currentIndex;
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={status}
                                className={`flex-1 text-center text-xs ${isCompleted || isActive ? 'text-green-600 font-semibold' : 'text-orange-500'}`}
                            >
                                {statusLabel(status)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default OrderProgressBar;
