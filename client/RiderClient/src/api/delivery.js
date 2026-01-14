import api from './axios';
import { getCurrentLocation } from './location';
import { getDistanceAndTime } from '../utils/orderParameters';

/**
 * Get delivery tasks for a rider by email
 * @param {string} email - Rider's email address
 * @returns {Promise} - Promise containing delivery tasks with real addresses
 */
export const getDeliveryTasks = async (email) => {
    try {
        const response = await api.get('/delivery-tasks/get-by-email', {
            params: { email }
        });
        console.log('Delivery tasks response:', response.data);
        
        // Enhance each delivery with real addresses from coordinates
        if (response.data && Array.isArray(response.data)) {
            const enhancedDeliveries = await Promise.all(
                response.data.map(delivery => enhanceDeliveryWithMockData(delivery))
            );
            return enhancedDeliveries;
        }
        
        return response.data;
    } catch (error) {
        console.error('Error fetching delivery tasks:', error);
        
        // Return mock data with real addresses on error for development
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
            const mockDeliveries = getMockDeliveryTasks();
            const enhancedMockDeliveries = await Promise.all(
                mockDeliveries.map(delivery => enhanceDeliveryWithMockData(delivery))
            );
            return enhancedMockDeliveries;
        }
        
        throw error;
    }
};

/**
 * Get delivered history for a rider by email with pagination and optional filters
 * @param {string} email - Rider's email address
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 10)
 * @param {number} orderId - Optional order ID to filter by
 * @param {string} date - Optional date to filter by (format: yyyy-MM-dd)
 * @returns {Promise} - Promise containing delivered orders history
 */
export const getDeliveredHistory = async (email, page = 0, size = 10, orderId = null, date = null) => {
    try {
        const params = { email, page, size };
        
        // Add optional filters if provided
        if (orderId) {
            params.orderId = orderId;
        }
        if (date) {
            params.date = date;
        }
        
        const response = await api.get('/delivery-tasks/get-delivered-history-by-email', {
            params
        });
        console.log('Delivered history response:', response.data);
        
        // Enhance each delivery with real addresses from coordinates
        if (response.data && Array.isArray(response.data)) {
            const enhancedDeliveries = await Promise.all(
                response.data.map(delivery => enhanceDeliveryWithMockData(delivery))
            );
            return enhancedDeliveries;
        }
        
        return response.data;
    } catch (error) {
        console.error('Error fetching delivered history:', error);
        
        // Return empty array on error
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
            return [];
        }
        
        throw error;
    }
};

/**
 * Get available orders for drivers to accept
 * @returns {Promise} - Promise containing available orders with distance and time calculations
 */
export const getAvailableOrders = async () => {
    try {
        const response = await api.get('/orders/available');
        console.log('Available orders response:', response.data);
        
        // Enhance each order with distance, time and delivery price calculations
        if (response.data && Array.isArray(response.data)) {
            const enhancedOrders = await Promise.all(
                response.data.map(order => enhanceAvailableOrder(order))
            );
            return enhancedOrders;
        }
        
        return response.data || [];
    } catch (error) {
        console.error('Error fetching available orders:', error);
        
        // Return empty array on error
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
            return [];
        }
        
        throw error;
    }
};

/**
 * Get delivery fee from backend
 * @param {number} totalDistance - Total distance from pickup to drop in km
 * @param {number} totalTime - Total time from pickup to drop in minutes
 * @returns {Promise} - Promise containing delivery fee
 */
export const getDeliveryFee = async (totalDistance, totalTime) => {
    try {
        const response = await api.get('/orders/getDeliveryFee', {
            params: { 
                totalDistance: parseFloat(totalDistance),
                totalTime: parseFloat(totalTime)
            }
        });
        console.log('Delivery fee response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting delivery fee:', error);
        // Fallback to local calculation if API fails
        return calculateDeliveryPrice(totalDistance);
    }
};

/**
 * Accept an available order
 * @param {number} orderId - Order ID to accept
 * @param {string} riderEmail - Rider's email address
 * @param {number} totalDistance - Total distance from pickup to drop in km
 * @param {number} totalTime - Total time from pickup to drop in minutes
 * @returns {Promise} - Promise containing acceptance result
 */
export const acceptOrder = async (orderId, riderEmail, totalDistance, totalTime) => {
    try {
        console.log('🎯 Accepting order with params:', {
            orderId,
            riderEmail,
            totalDistance,
            totalTime
        });
        
        const response = await api.post('/orders/accept', null, {
            params: { 
                orderId, 
                riderEmail, 
                totalDistance: parseFloat(totalDistance),
                totalTime: parseFloat(totalTime)
            }
        });
        
        console.log('✅ Order acceptance response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error accepting order:', error);
        throw error;
    }
};

/**
 * Reject an available order
 * @param {number} orderId - Order ID to reject
 * @param {string} email - Rider's email address
 * @returns {Promise} - Promise containing rejection response
 */
export const rejectOrder = async (orderId, email) => {
    try {
        console.log('🚫 Rejecting order with params:', {
            orderId,
            email
        });
        
        const response = await api.post('/orders/rejectOrder', null, {
            params: { 
                orderId, 
                email
            }
        });
        
        console.log('✅ Order rejection response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error rejecting order:', error);
        throw error;
    }
};

/**
 * Update delivery status
 * @param {number} orderId - Order ID to update
 * @param {string} status - New status to set
 * @returns {Promise} - Promise containing updated delivery details
 */
export const updateDeliveryStatus = async (orderId, status) => {
    try {
        const response = await api.post('/delivery-tasks/update-status', null, {
            params: { orderId, status }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating delivery status:', error);
        throw error;
    }
};

/**
 * Validate OTP for delivery completion
 * @param {number} orderId - Order ID
 * @param {string} otp - OTP to validate
 * @returns {Promise} - Promise containing validation result
 */
export const validateDeliveryOtp = async (orderId, otp) => {
    console.log('🔐 Validating OTP:', { orderId, otp: parseInt(otp) });
    
    try {
        const response = await api.get('/delivery-tasks/validate-otp', {
            params: { orderId, otp: parseInt(otp) }
        });
        
        console.log('✅ OTP validation successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ OTP validation failed:', error);
        throw error;
    }
};

/**
 * Submit delivery failure reason
 * @param {number} orderId - Order ID
 * @param {string} reason - Failure reason
 * @returns {Promise} - Promise containing submission result
 */
export const submitFailureReason = async (orderId, reason) => {
    try {
        // TODO: Implement when backend endpoint is ready
        const response = await api.post('/delivery-tasks/submit-failure', {
            orderId,
            reason
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting failure reason:', error);
        throw error;
    }
};

// Delivery status constants
export const DELIVERY_STATUS = {
    ACCEPTED: 'ACCEPTED',
    GO_TO_PICKUP: 'GO_TO_PICKUP',
    PICKED_UP: 'PICKED_UP',
    ON_THE_WAY: 'ON_THE_WAY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED'
};

// Mock data helper to enhance delivery details with real backend data
export const enhanceDeliveryWithMockData = async (delivery) => {
    console.log('🔍 Getting addresses for delivery:', delivery.deliveryId || delivery.orderId);
    
    // Use real customer data from backend or fallback
    const customer = {
        name: delivery.customerName || delivery.customerEmail?.split('@')[0] || 'Unknown Customer',
        phone: delivery.customerPhone || '+1 (555) 000-0000'
    };

    // Generate real addresses from coordinates
    const [pickupAddress, deliveryAddress] = await Promise.all([
        generateAddressFromCoordinates(delivery.pickup_lat, delivery.pickup_lng, 'restaurant'),
        generateAddressFromCoordinates(delivery.drop_lat, delivery.drop_lng, 'customer')
    ]);

    console.log('📍 Generated addresses:', { 
        pickup: pickupAddress, 
        delivery: deliveryAddress 
    });

    // Use real restaurant data from backend or fallback
    const restaurant = {
        name: delivery.restaurantName || `Restaurant ${delivery.restaurantId}`,
        address: pickupAddress,
        phone: delivery.restaurantPhone || '+1 (555) 000-0000'
    };

    // Format order items from backend data
    const orderItems = delivery.orderItems ? 
        delivery.orderItems.map(item => `${item.quantity}x ${item.itemName}`) :
        generateMockOrderItems(delivery.order_price);

    // Calculate real distance and time based on current location and delivery status
    let routeInfo = { distance: 'N/A', time: 'N/A' };
    try {
        const currentLocation = await getCurrentLocation();
        const destinationLat = delivery.status === DELIVERY_STATUS.ACCEPTED || delivery.status === DELIVERY_STATUS.GO_TO_PICKUP
            ? delivery.pickup_lat   // Go to restaurant first
            : delivery.drop_lat;    // Then to customer
        const destinationLng = delivery.status === DELIVERY_STATUS.ACCEPTED || delivery.status === DELIVERY_STATUS.GO_TO_PICKUP
            ? delivery.pickup_lng
            : delivery.drop_lng;
            
        const result = await getDistanceAndTime(
            currentLocation.latitude,
            currentLocation.longitude,
            destinationLat,
            destinationLng
        );
        
        if (result.success) {
            routeInfo = {
                distance: `${result.distance} km`,
                time: `${result.time} mins`,
                estimatedTime: `${result.time} mins`
            };
            console.log('🗺️ Real route calculated:', routeInfo);
        } else {
            console.warn('⚠️ Route calculation failed, using fallback');
            routeInfo = getEstimatedTimeAndDistance(delivery.status);
        }
    } catch (error) {
        console.warn('⚠️ Location access failed, using fallback estimation:', error);
        routeInfo = getEstimatedTimeAndDistance(delivery.status);
    }

    const enhancedDelivery = {
        ...delivery,
        customer: customer,
        restaurant: restaurant,
        customerName: delivery.customerName || customer.name,
        customerPhone: delivery.customerPhone || customer.phone,
        restaurantName: delivery.restaurantName || restaurant.name,
        restaurantPhone: delivery.restaurantPhone || restaurant.phone,
        // Use real pickup address from coordinates
        pickupAddress: pickupAddress,
        // Use real delivery address from coordinates
        deliveryAddress: deliveryAddress,
        // Calculate real estimated time and distance
        estimatedTime: routeInfo.estimatedTime,
        distance: routeInfo.distance,
        routeTime: routeInfo.time,
        // Use formatted order items
        orderItems: orderItems
    };

    return enhancedDelivery;
};

// Generate realistic address from coordinates using reverse geocoding
const generateAddressFromCoordinates = async (lat, lng, type) => {
    try {
        // Use Mapbox Geocoding API for reverse geocoding
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Geocoding API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Geo Data",data);
        
        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            let address = feature.place_name;
            
            console.log(`📍 Found ${type} address:`, address);
            
            // Clean up the address for better display
            if (feature.properties && feature.properties.address) {
                const number = feature.properties.address;
                const street = feature.text;
                const context = feature.context || [];
                
                // Find locality/city from context
                const locality = context.find(c => c.id.includes('locality') || c.id.includes('place'));
                const localityName = locality ? locality.text : '';
                
                if (number && street) {
                    address = `${number} ${street}${localityName ? `, ${localityName}` : ''}`;
                } else {
                    address = street + (localityName ? `, ${localityName}` : '');
                }
            }
            
            return address;
        }
    } catch (error) {
        console.error(`❌ Geocoding error for ${type}:`, error.message);
    }
    
    // Fallback to mock address generation if geocoding fails
    console.log(`🔄 Using fallback address for ${type}`);
    return generateFallbackAddress(lat, lng, type);
};
            // return address;
//         }
//     } catch (error) {
//         console.error(`❌ Error getting address from coordinates for ${type}:`, error);
//     }
    
//     // Fallback to mock address generation if geocoding fails
//     console.log(`🔄 Using fallback address generation for ${type}`);
//     return generateFallbackAddress(lat, lng, type);
// };

// Fallback address generation when reverse geocoding fails
const generateFallbackAddress = (lat, lng, type) => {
    const streetNumber = Math.floor((lat + lng) * 1000) % 999 + 1;
    const streetNames = {
        restaurant: [
            'Restaurant Avenue', 'Food Court Boulevard', 'Kitchen Street', 
            'Chef\'s Lane', 'Culinary Drive', 'Bistro Road', 'Cafe Circle'
        ],
        customer: [
            'Main Street', 'Oak Avenue', 'Maple Drive', 'Cedar Lane', 
            'Pine Road', 'Elm Street', 'Washington Boulevard', 'Park Avenue'
        ]
    };
    
    const streetName = streetNames[type][Math.floor((lat * lng * 100) % streetNames[type].length)];
    const areas = [
        'Downtown', 'Uptown', 'City Center', 'Suburb Hills', 
        'Garden District', 'Business District', 'Residential Area'
    ];
    const area = areas[Math.floor((lat + lng) * 10) % areas.length];
    
    return `${streetNumber} ${streetName}, ${area}`;
};

// Fallback estimation when real calculation fails
const getEstimatedTimeAndDistance = (status) => {
    switch (status) {
        case DELIVERY_STATUS.ACCEPTED:
        case DELIVERY_STATUS.GO_TO_PICKUP:
            return {
                distance: '2-5 km',
                time: '10-15 mins',
                estimatedTime: '10-15 mins to pickup'
            };
        case DELIVERY_STATUS.PICKED_UP:
        case DELIVERY_STATUS.ON_THE_WAY:
            return {
                distance: '3-7 km',
                time: '15-20 mins',
                estimatedTime: '15-20 mins to delivery'
            };
        default:
            return {
                distance: 'N/A',
                time: 'N/A',
                estimatedTime: 'N/A'
            };
    }
};

const generateMockOrderItems = (orderPrice) => {
    const items = [
        'Pizza Margherita',
        'Chicken Burger',
        'Sushi Roll',
        'Beef Tacos',
        'Chicken Curry',
        'Caesar Salad',
        'Garlic Bread',
        'French Fries',
        'Coca Cola',
        'Ice Cream'
    ];

    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const selectedItems = [];
    
    for (let i = 0; i < numItems; i++) {
        selectedItems.push(items[Math.floor(Math.random() * items.length)]);
    }

    return selectedItems;
};

// Mock delivery tasks for development when API is not available
const getMockDeliveryTasks = () => {
    return [
        {
            deliveryId: 'DEL-001',
            orderId: 1001,
            restaurantName: 'Pizza Palace',
            restaurantPhone: '+94 11 234 5678',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '+94 77 987 6543',
            order_price: 2599.00, // LKR
            delivery_price: 450.00, // LKR
            pickup_lat: 6.9271, // Colombo Fort area
            pickup_lng: 79.8612,
            drop_lat: 6.9344, // Kollupitiya area
            drop_lng: 79.8428,
            status: DELIVERY_STATUS.ACCEPTED,
            orderItems: [
                { quantity: 1, itemName: 'Large Pepperoni Pizza' },
                { quantity: 2, itemName: 'Garlic Bread' }
            ]
        },
        {
            deliveryId: 'DEL-002',
            orderId: 1002,
            restaurantName: 'Burger Junction',
            restaurantPhone: '+94 11 345 6789',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            customerPhone: '+94 76 876 5432',
            order_price: 1875.00, // LKR
            delivery_price: 325.00, // LKR
            pickup_lat: 6.9155, // Bambalapitiya area
            pickup_lng: 79.8725,
            drop_lat: 6.9022, // Wellawatta area
            drop_lng: 79.8541,
            status: DELIVERY_STATUS.GO_TO_PICKUP,
            orderItems: [
                { quantity: 2, itemName: 'Classic Cheeseburger' },
                { quantity: 1, itemName: 'French Fries' }
            ]
        },
        {
            deliveryId: 'DEL-003',
            orderId: 1003,
            restaurantName: 'Spice Garden',
            restaurantPhone: '+94 11 456 7890',
            customerName: 'Ashen Fernando',
            customerEmail: 'ashen@example.com',
            customerPhone: '+94 71 765 4321',
            order_price: 3250.00, // LKR
            delivery_price: 500.00, // LKR
            pickup_lat: 6.9319, // Cinnamon Gardens area
            pickup_lng: 79.8478,
            drop_lat: 6.8649, // Mount Lavinia area
            drop_lng: 79.8997,
            status: DELIVERY_STATUS.ON_THE_WAY,
            orderItems: [
                { quantity: 1, itemName: 'Kottu Roti' },
                { quantity: 1, itemName: 'Fish Curry' },
                { quantity: 2, itemName: 'Plain Rice' }
            ]
        }
    ];
};

/**
 * Enhance available order with distance, time and delivery price calculations
 * @param {Object} order - Raw order data from backend
 * @returns {Object} - Enhanced order with distance, time and delivery price
 */
export const enhanceAvailableOrder = async (order) => {
    try {
        // Get addresses for pickup and delivery locations first
        const [pickupAddress, deliveryAddress] = await Promise.all([
            generateAddressFromCoordinates(order.pickupLat, order.pickupLng, 'restaurant'),
            generateAddressFromCoordinates(order.dropLat, order.dropLng, 'customer')
        ]);
        
        // Get rider's current location
        const currentLocation = await getCurrentLocation();
        
        if (!currentLocation) {
            console.warn('Could not get current location for order enhancement');
            return {
                ...order,
                distance: 'Location unavailable',
                estimatedTime: 'Location unavailable', 
                deliveryPrice: 250.00, // Default fallback price
                canAccept: true,
                pickupAddress,
                deliveryAddress
            };
        }
        
        const { latitude: riderLat, longitude: riderLng } = currentLocation;
        console.log('📍 Rider location:', { lat: riderLat, lng: riderLng });
        
        // Calculate distance and time from rider to pickup location (MAIN DISPLAY)
        const riderToPickupResult = await getDistanceAndTime(
            riderLat, riderLng,
            order.pickupLat, order.pickupLng
        );
        console.log('🚗 Rider to pickup result:', riderToPickupResult);
        
        // Calculate distance and time from pickup to delivery location (FOR DELIVERY FEE)

        console.log("cordinates",order.pickupLat, order.pickupLng,order.dropLat, order.dropLng);

        const pickupToDropResult = await getDistanceAndTime(
            order.pickupLat, order.pickupLng,
            order.dropLat, order.dropLng
        );
        console.log('🏪 Pickup to drop result:', pickupToDropResult);
        
        let deliveryPrice = 250.00; // Default fallback
        
        // Get delivery fee from backend using pickup-to-drop distance and time
        if (pickupToDropResult.success) {
            const pickupToDropDistance = parseFloat(pickupToDropResult.distance);
            const pickupToDropTime = parseInt(pickupToDropResult.time);
            
            console.log('📊 Calculating delivery fee with:', { distance: pickupToDropDistance, time: pickupToDropTime });
            
            try {
                deliveryPrice = await getDeliveryFee(pickupToDropDistance, pickupToDropTime);
                console.log('💰 Backend delivery fee:', deliveryPrice);
            } catch (error) {
                console.error('❌ Failed to get delivery fee from backend:', error);
                deliveryPrice = calculateDeliveryPrice(pickupToDropDistance);
                console.log('💰 Fallback delivery fee:', deliveryPrice);
            }
        } else {
            console.warn('⚠️ Could not calculate pickup to drop route, using fallback price');
        }
        
        // Format the distance and time to pickup for prominent display
        let distanceToPickup = 'N/A';
        let timeToPickup = 'N/A';
        
        if (riderToPickupResult.success) {
            distanceToPickup = `${riderToPickupResult.distance} km`;
            timeToPickup = `${riderToPickupResult.time} min`;
        }
        
        return {
            ...order,
            distance: distanceToPickup, // Distance from rider to pickup (PROMINENT)
            estimatedTime: timeToPickup, // Time from rider to pickup (PROMINENT)
            deliveryPrice: typeof deliveryPrice === 'number' ? deliveryPrice : parseFloat(deliveryPrice) || 250.00,
            pickupDistance: riderToPickupResult.success ? riderToPickupResult.distance : 'N/A',
            deliveryDistance: pickupToDropResult.success ? pickupToDropResult.distance : 'N/A',
            pickupToDropDistance: pickupToDropResult.success ? pickupToDropResult.distance : 'N/A',
            pickupToDropTime: pickupToDropResult.success ? pickupToDropResult.time : 'N/A',
            pickupAddress, // Real address from coordinates
            deliveryAddress, // Real address from coordinates
            canAccept: true
        };
        
    } catch (error) {
        console.error('Error enhancing available order:', error);
        
        // Get addresses even if other calculations fail
        let pickupAddress = 'Address not available';
        let deliveryAddress = 'Address not available';
        
        try {
            [pickupAddress, deliveryAddress] = await Promise.all([
                generateAddressFromCoordinates(order.pickupLat, order.pickupLng, 'restaurant'),
                generateAddressFromCoordinates(order.dropLat, order.dropLng, 'customer')
            ]);
        } catch (addressError) {
            console.error('Error getting addresses:', addressError);
        }
        
        return {
            ...order,
            distance: 'Calculation failed',
            estimatedTime: 'Calculation failed',
            deliveryPrice: 250.00, // Default delivery price
            pickupAddress,
            deliveryAddress,
            canAccept: true
        };
    }
};

/**
 * Calculate delivery price based on distance
 * @param {number} distance - Total distance in km
 * @returns {number} - Delivery price in LKR
 */
export const calculateDeliveryPrice = (distance) => {
    const basePrice = 200; // Base price LKR 200
    const pricePerKm = 50; // LKR 50 per km
    const minimumPrice = 250; // Minimum delivery price LKR 250
    
    const calculatedPrice = basePrice + (distance * pricePerKm);
    return Math.max(calculatedPrice, minimumPrice);
};