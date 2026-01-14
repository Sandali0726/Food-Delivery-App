import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw";
// or directly: mapboxgl.accessToken = "pk.xxxxx";

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);



  const getRoute = async () => {
        const start = "79.865,6.92";     // driver
        const end = "79.88,6.93";        // customer

        const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );

        const data = await res.json();
        return data.routes[0].geometry;
    };


    const drawRoute = async () => {
        const route = await getRoute();

        if (map.current.getSource("route")) {
            map.current.getSource("route").setData({
            type: "Feature",
            geometry: route,
            });
        } else {
            map.current.addSource("route", {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: route,
            },
            });

            map.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            paint: {
                "line-color": "#ff7a00",
                "line-width": 5,
            },
            });
        }
    };



  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [79.8612, 6.9271], // Colombo
      zoom: 15,
    });

    const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = "url('/images/scooter.png')";
        el.style.width = "40px";
        el.style.height = "40px";

    new mapboxgl.Marker({color: "red"})
    .setLngLat([79.865, 6.92])
    .setPopup(new mapboxgl.Popup().setText("Driver"))
    .addTo(map.current);

    new mapboxgl.Marker({ color: "green" })
    .setLngLat([79.88, 6.93])
    .setPopup(new mapboxgl.Popup().setText("Customer"))
    .addTo(map.current);



    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.on("load", drawRoute);
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}

export default Map;
