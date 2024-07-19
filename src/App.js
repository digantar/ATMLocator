import './App.css';
import { useState, useEffect } from 'react'
import MapComponent from './component/Map';

const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        resolve({
          lat,
          lng
        })
      }, (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("User denied the request for Geolocation."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("The request to get user location timed out."));
            break;
          case error.UNKNOWN_ERROR:
            reject(new Error("An unknown error occurred."));
            break;
        }
      });
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }

  })
}


// Call the function to get the current location

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Helper function to convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Function to sort an array of coordinates by proximity to a given point
function sortCoordinatesByProximity(coords, referenceLat, referenceLon) {
  return coords.sort((a, b) => {
      const distanceA = haversineDistance(referenceLat, referenceLon, a.coord.lat, a.coord.lng);
      const distanceB = haversineDistance(referenceLat, referenceLon, b.coord.lat, b.coord.lng);
      return distanceA - distanceB;
  });
}

const randomizeSign = (num) => {
  const randNum = Math.random() * 10
  if (randNum < 5) {
      return (-1 * num)
  }
  return num
}

const genLocationsFromCenter = (center) => {
  const locations = []
  for (let i = 0; i < 10; i++) {
      const coord = {
        lat: center.lat + randomizeSign(Math.random() / 100),
        lng: center.lng + randomizeSign(Math.random() / 100)
      }
      const distance = haversineDistance(center.lat, center.lng, coord.lat, coord.lng)
      locations.push({
          id: i,
          coord,
          atmName: `ATM ${i+1}`,
          distance: `${distance.toFixed(2)} Km`,
          cashAvailable: (Math.random() * 10) < 5
      })
  }
  return sortCoordinatesByProximity(locations, center.lat, center.lng)
}

const locationContainerStyle = {
  position: 'fixed',
  left: '50%',
  marginLeft: '-45vw',
  width: '90vw',
  height: '40vh',
  backgroundColor: '#fff',
  borderRadius: '10px',
  display: 'block',
  bottom: 0,
}

const locationItemStyle = {
  display: 'flex',
  flexDirection: 'row',
  fontSize: '25px',
  lineHeight: '35px',
  boxSizing: 'border-box',
  padding: '16px',
  borderBottom: '1px solid #c2c2c2'
}

const App = () => {
  // const [isLocationAvailable, setIsLocationAvailable] = useState(false)
  const [currLocCoord, setCurrLocCoord] = useState(undefined)
  const [isLocationFetchTried, setIsLocationFetchTried] = useState(false)
  const [locations, setLocations] = useState([])
  const [withdrawAmt, setWithdrawAmt] = useState(0)
  const [tagEnabled, setTagEnabled] = useState(false)

  useEffect(() => {
    if (!isLocationFetchTried) {
      getCurrentLocation()
      .then((coordinate) => {
        setCurrLocCoord(coordinate)
      })
        .catch(console.error)
        .finally(() => {
          setIsLocationFetchTried(true)
        })
    }
  }, [isLocationFetchTried])

  useEffect(() => {
    if (currLocCoord) {
      setLocations(genLocationsFromCenter(currLocCoord))
    }
  }, [currLocCoord])

  useEffect(() => {
    setTagEnabled(withdrawAmt > 0)
  }, [withdrawAmt])

  useEffect(() => {
    console.log("locations", locations)
  }, [locations])

  return (
    <div className="App">
      {<MapComponent
          center={currLocCoord}
          locations={locations}/>}
      <div style={{
        position: 'fixed',
        left: '50%',
        marginLeft: '-45vw',
        width: '90vw',
        height: 'auto',
        top: '3vh',
        display: 'block',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
        padding: '10px',
        borderRadius: '10px'
      }}>
        <span
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            paddingBottom: '7px',
            display: 'inline-block',
          }}>
          Withdraw Amount (Rs)
        </span>
        <input
          onChange={e => setWithdrawAmt(e.target.value)}
          value={withdrawAmt}
          type="number"
          style={{
            padding: "5px",
            fontSize: '30px'
          }}/>
      </div>
      <div style={locationContainerStyle}>
        <h3>
          Nearby ATMs
        </h3>
        <div
          style={{
            height: '30vh',
            overflowY: 'scroll'
          }}>
          {locations.map(location => (
            <div
              key={location.id}
              style={locationItemStyle}>
              <div style={{padding: '0px 10px'}}>
                {location.atmName}
              </div>
              <div
                style={{
                  flexGrow: 1,
                  padding: '0px 10px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  textAlign: 'right'
                }}>
                {tagEnabled && location.cashAvailable &&
                <span style={{
                  backgroundColor: "green",
                  color: '#fff',
                  padding: '5px',
                  fontSize: '10px'
                }}>
                  Cash Available
                </span>}
                <span
                  style={{
                    display: 'inline-block',
                    width: '100px'
                  }}>

                {location.distance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default App;
