// OrderStatusFlow.js
export const ORDER_STATUS_FLOW = [
    'CONFIRM',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'GO_TO_PICKUP',
    'PICKED_UP',
    'ON_THE_WAY',
    'DELIVERED',
];
// Color configurations for each order status
export const ORDER_STATUS_COLORS = {
    CONFIRM: {
        bg: 'bg-blue-600',
        lightBg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-300',
        shadow: 'shadow-blue-500/20',
        icon: 'text-blue-600',
        progressBg: 'bg-blue-800',
        gradient: 'from-blue-500 to-blue-600',
    },
    ACCEPTED: {
        bg: 'bg-emerald-600',
        lightBg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        shadow: 'shadow-emerald-500/20',
        icon: 'text-emerald-600',
        progressBg: 'bg-emerald-800',
        gradient: 'from-emerald-500 to-emerald-600',
    },
    PREPARING: {
        bg: 'bg-amber-600',
        lightBg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-300',
        shadow: 'shadow-amber-500/20',
        icon: 'text-amber-600',
        progressBg: 'bg-amber-800',
        gradient: 'from-amber-500 to-amber-600',
    },
    READY: {
        bg: 'bg-purple-600',
        lightBg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-300',
        shadow: 'shadow-purple-500/20',
        icon: 'text-purple-600',
        progressBg: 'bg-purple-800',
        gradient: 'from-purple-500 to-purple-600',
    },
    GO_TO_PICKUP: {
        bg: 'bg-indigo-600',
        lightBg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-300',
        shadow: 'shadow-indigo-500/20',
        icon: 'text-indigo-600',
        progressBg: 'bg-indigo-800',
        gradient: 'from-indigo-500 to-indigo-600',
    },
    PICKED_UP: {
        bg: 'bg-cyan-600',
        lightBg: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-300',
        shadow: 'shadow-cyan-500/20',
        icon: 'text-cyan-600',
        progressBg: 'bg-cyan-800',
        gradient: 'from-cyan-500 to-cyan-600',
    },
    ON_THE_WAY: {
        bg: 'bg-orange-600',
        lightBg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-300',
        shadow: 'shadow-orange-500/20',
        icon: 'text-orange-600',
        progressBg: 'bg-orange-800',
        gradient: 'from-orange-500 to-orange-600',
    },
    DELIVERED: {
        bg: 'bg-green-600',
        lightBg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        shadow: 'shadow-green-500/20',
        icon: 'text-green-600',
        progressBg: 'bg-green-800',
        gradient: 'from-green-500 to-green-600',
    },
    // CANCEL is not in the flow, but has color configuration for notifications
    CANCEL: {
        bg: 'bg-red-600',
        lightBg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        shadow: 'shadow-red-500/20',
        icon: 'text-red-600',
        progressBg: 'bg-red-800',
        gradient: 'from-red-500 to-red-600',
    },
};
// Helper function to get status color configuration
export const getStatusColor = (status) => {
    return ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.CONFIRM;
};
// Helper function to get status label
export const getStatusLabel = (status) => {
    const labels = {
        CONFIRM: 'Confirming Order',
        ACCEPTED: 'Order Accepted',
        PREPARING: 'Preparing Food',
        READY: 'Food Ready',
        GO_TO_PICKUP: 'Driver Assigned',
        PICKED_UP: 'Order Picked Up',
        ON_THE_WAY: 'On The Way',
        DELIVERED: 'Delivered',
        CANCEL: 'Order Cancelled',
    };
    return labels[status] || status;
};
