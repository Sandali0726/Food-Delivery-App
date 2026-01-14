/**
 * Test script to verify reverse geocoding functionality
 * Run this in the browser console to test address generation
 */

// Test coordinates (Colombo, Sri Lanka area)
const testCoordinates = [
    { lat: 6.9271, lng: 79.8612, type: 'restaurant', name: 'Colombo City Center' },
    { lat: 6.9344, lng: 79.8428, type: 'customer', name: 'Kollupitiya Area' },
    { lat: 6.9155, lng: 79.8725, type: 'restaurant', name: 'Bambalapitiya Area' },
    { lat: 6.9022, lng: 79.8541, type: 'customer', name: 'Wellawatta Area' }
];

/**
 * Test function to check reverse geocoding
 */
async function testReverseGeocoding() {
    console.log('🧪 Starting reverse geocoding tests...');
    
    for (const coord of testCoordinates) {
        try {
            console.log(`\n📍 Testing ${coord.name} (${coord.type})`);
            console.log(`   Coordinates: ${coord.lat}, ${coord.lng}`);
            
            const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZ2F5YXNoYW5kc2lsdmEiLCJhIjoiY2x6cW9tdWV2MDMxNzJtcHRkNDMybHAzNCJ9.kJ3dXEOIDj2vJbwxfX3qIA';
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coord.lng},${coord.lat}.json?access_token=${mapboxToken}&types=address,poi`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                console.log(`✅ Found: ${feature.place_name}`);
                console.log(`   Type: ${feature.place_type?.[0] || 'unknown'}`);
                console.log(`   Relevance: ${feature.relevance}`);
            } else {
                console.log(`❌ No address found for ${coord.name}`);
            }
            
        } catch (error) {
            console.error(`❌ Error testing ${coord.name}:`, error);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🏁 Reverse geocoding tests completed!');
}

// Export for use
window.testReverseGeocoding = testReverseGeocoding;

// Auto-run test if in browser console
if (typeof window !== 'undefined') {
    console.log('🔧 Reverse geocoding test function loaded!');
    console.log('   Run testReverseGeocoding() to test the implementation');
}

export default testReverseGeocoding;