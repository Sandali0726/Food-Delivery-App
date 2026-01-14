// SetOnMapAddress.jsx
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {addressAPI} from "../../services/api";

mapboxgl.accessToken = "pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw";

export default function SetOnMapAddress({ onSave, onCancel ,from}) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [markerCoords, setMarkerCoords] = useState(null);
    const [address, setAddress] = useState("Getting address...");
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);
    const [label, setLabel] = useState("");

    // Fetch address from coordinates
    const fetchAddress = async (lat, lng) => {
        setIsLoadingAddress(true);
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
            );
            const data = await res.json();
            const place = data.features?.[0]?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setAddress(place);
        } catch (err) {
            console.error("Geocoding failed:", err);
            setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Initialize map
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setMarkerCoords({ lat, lng });

                const map = new mapboxgl.Map({
                    container: mapRef.current,
                    style: "mapbox://styles/mapbox/streets-v12",
                    center: [lng, lat],
                    zoom: 14,
                });

                const marker = new mapboxgl.Marker({ draggable: true })
                    .setLngLat([lng, lat])
                    .addTo(map);

                marker.on("dragend", () => {
                    const { lat, lng } = marker.getLngLat();
                    setMarkerCoords({ lat, lng });
                    fetchAddress(lat, lng);
                });

                markerRef.current = marker;

                fetchAddress(lat, lng);

                return () => map.remove();
            },
            (err) => {
                console.error("Geolocation failed:", err);
                const lat = 6.9271;
                const lng = 79.8612; // fallback to Colombo
                setMarkerCoords({ lat, lng });

                const map = new mapboxgl.Map({
                    container: mapRef.current,
                    style: "mapbox://styles/mapbox/streets-v12",
                    center: [lng, lat],
                    zoom: 14,
                });

                const marker = new mapboxgl.Marker({ draggable: true })
                    .setLngLat([lng, lat])
                    .addTo(map);

                marker.on("dragend", () => {
                    const { lat, lng } = marker.getLngLat();
                    setMarkerCoords({ lat, lng });
                    fetchAddress(lat, lng);
                });

                markerRef.current = marker;
                fetchAddress(lat, lng);

                return () => map.remove();
            }
        );
    }, []);

    const handleSave = () => {
        if (!markerCoords) return;
        const { lat, lng } = markerCoords;
        const finalAddress = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        if (!label.trim()) {
            alert("Please enter a label for this address");
            return;
        }

        const email = localStorage.getItem('userEmail');
        if (!email) {
            alert("User email not found");
            return;
        }

        // Call API to save to backend
        addressAPI.create(email, {
            label: label.trim(),
            address: finalAddress,
            lat: lat.toString(),
            lng: lng.toString(),
        })
            .then(res => {
                // res.data is the address saved in DB
                onSave(res.data); // pass saved address to parent component
            })
            .catch(err => {
                console.error("Failed to save address", err);
                alert("Failed to save address");
            });
    };


    return (
        <div className="relative w-full h-full">
            {/* Address + Label Inputs */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-lg flex flex-col gap-2">
                <input
                    type="text"
                    value={isLoadingAddress ? "Getting address..." : address}
                    readOnly
                    className={`w-full p-3 rounded-xl border bg-white text-gray-900 shadow-md ${isLoadingAddress ? "animate-pulse" : ""}`}
                />
                <input
                    type="text"
                    placeholder="Enter label (Home, Work, etc.)"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white text-gray-900 shadow-md"
                />
            </div>

            {/* Map */}
            <div ref={mapRef} className="w-full h-[90vh]" />

            {/* Buttons */}
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl shadow-md hover:bg-gray-400 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition-colors"
                >
                    Save Address
                </button>
            </div>
        </div>
    );
}
