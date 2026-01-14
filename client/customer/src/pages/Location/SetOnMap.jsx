import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

mapboxgl.accessToken = "pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw";

export default function SetOnMap() {
    const mapRef = useRef(null);
    const navigate = useNavigate();
    const [markerCoords, setMarkerCoords] = useState(null); // start with null
    const [address, setAddress] = useState("Getting your location...");
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);

    useEffect(() => {
        // Get user's current location
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setMarkerCoords({ lat, lng });

                // Initialize map once we have coordinates
                const map = new mapboxgl.Map({
                    container: mapRef.current,
                    style: "mapbox://styles/mapbox/streets-v12",
                    center: [lng, lat],
                    zoom: 14
                });

                const marker = new mapboxgl.Marker({ draggable: true })
                    .setLngLat([lng, lat])
                    .addTo(map);

                // Function to get address from coordinates
                const getAddressFromCoords = async (lat, lng) => {
                    setIsLoadingAddress(true);
                    try {
                        const response = await fetch(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
                        );
                        const data = await response.json();
                        const placeName = data.features?.[0]?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        setAddress(placeName);
                    } catch (error) {
                        console.error("Geocoding failed:", error);
                        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    } finally {
                        setIsLoadingAddress(false);
                    }
                };

                // Set initial address
                getAddressFromCoords(lat, lng);

                marker.on("dragend", async () => {
                    const { lat, lng } = marker.getLngLat();
                    setMarkerCoords({ lat, lng });
                    // Update address when marker is dragged
                    await getAddressFromCoords(lat, lng);
                });

                return () => map.remove();
            },
            (err) => {
                console.error("Error getting location:", err);
            }
        );
    }, []);

    const handleConfirm = () => {
        if (!markerCoords) return;

        const { lat, lng } = markerCoords;
        const finalAddress = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        localStorage.setItem("userLocationAddress", finalAddress);
        localStorage.setItem("userLocationLat", lat);
        localStorage.setItem("userLocationLng", lng);

         navigate(-1);
    };
    return (
        <>
            {/* Address Box */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-lg">
                <input
                    type="text"
                    value={isLoadingAddress ? "Getting address..." : address}
                    readOnly
                    className={`w-full p-3 rounded-xl border bg-white text-gray-900 shadow-md ${isLoadingAddress ? 'animate-pulse' : ''}`}
                />
            </div>
            <div ref={mapRef} style={{ height: "90vh" }} />
            {markerCoords && (
                <button
                    onClick={handleConfirm}
                    className="fixed bottom-5 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-primary text-white rounded-xl shadow-md"
                >
                    Confirm Location
                </button>
            )}
        </>
    );

}
