import { useEffect, useState } from "react";

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};


const MapComponent = ({
    center,
    locations
}) => {
    
    useEffect(() => {
        async function loadMap () {
            const { Map } = await window.google.maps.importLibrary("maps");
            // const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
            //     "marker",
            // );
            const map = new Map(document.getElementById("map"), {
                center: center,
                zoom: 14,
                mapId: "4504f8b37365c3d0",
            })

            locations.forEach((location) => {
                new window.google.maps.Marker({
                    position: location.coord,
                    map,
                    title: "Hello World!",
                    onclick: (e) => {
                        console.log("this marker was clicked", e)
                    }
                });
            })
        }
        if (center) {
            loadMap()
        }
    }, [center, locations])

    return (
        <>
            <div id="map" style={mapContainerStyle}>

            </div>
        </>
    )
}

export default MapComponent