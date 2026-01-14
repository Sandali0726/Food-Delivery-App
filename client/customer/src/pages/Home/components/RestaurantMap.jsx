import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw";

const RestaurantMap = ({ restaurants }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [79.8612, 6.9271], // default center (Colombo)
            zoom: 10,
        });

        map.current.addControl(new mapboxgl.NavigationControl());
    }, []);

    useEffect(() => {
        if (!map.current) return;

        // Remove old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        restaurants.forEach((r) => {
            const el = document.createElement("img");
            el.src = "https://i.ibb.co/W4XK4zgk/location-651110.png"; // your icon
            el.style.width = "30px";
            el.style.height = "30px";
            el.style.cursor = "pointer";
            const marker = new mapboxgl.Marker(el)
                .setLngLat([r.longitude, r.latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
                        .setHTML(`
              <div style="width:150px;text-align:center;">
                <img src="${r.coverImageUrl}" alt="${r.name}" style="width:100%;border-radius:6px;"/>
                <h3 style="font-size:14px;margin:5px 0;">${r.name}</h3>
              </div>
            `)
                )
                .addTo(map.current);

            el.addEventListener("mouseenter", () => marker.togglePopup());
            el.addEventListener("mouseleave", () => marker.togglePopup());
            el.addEventListener("click", () => {
                window.location.href = `/restaurant/${r.id}`;
            });

            markersRef.current.push(marker);
        });
    }, [restaurants]);

    return (
      <div className="w-full h-[50vh] sm:h-[60vh] lg:h-[70vh]">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    );
};

export default RestaurantMap;
