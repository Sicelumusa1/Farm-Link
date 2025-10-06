// /* eslint-disable react/prop-types */
// import { createContext, useState } from "react";


// export const GetCurrentLocationContext = createContext();

// export const CurrentLocationProvider = ({children}) => {
//     const [coordinates, setCoordinates] = useState({ "latitude": "", "longitude": ""});
//     const [latitude, setLatitude] = useState('');
//     const [longitude, setLongitude] = useState('');

//     const handleGetLocation = () => {
//         //Pops up prompt for allowing App to get user's current location
//         navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
//         enableHighAccuracy: true
//         })
//     }
        
//     const successLocation = (position) => {
//         //Set state of coordinates when Allow current location is accepted
//         setLatitude(position.coords.latitude);
//         setLongitude(position.coords.longitude);
//         if (longitude && latitude) {
//         setCoordinates({"latitude": latitude, "longitude": longitude});
//         } 
//     }

//     const errorLocation = (error) => {
//         /*handles an error with getting current location,
//         or user disagrees to allow App to get user's current Location.*/
//         console.log(error) //test
//     }
//     return (
//         <GetCurrentLocationContext.Provider value={{coordinates, handleGetLocation}}>
//             {children}
//         </GetCurrentLocationContext.Provider>
//     )
// }
// LocationContext.js - Improved with better error handling
import { createContext, useState } from "react";

export const GetCurrentLocationContext = createContext();

export const CurrentLocationProvider = ({children}) => {
    const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });
    const [locationError, setLocationError] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const handleGetLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const error = new Error('Geolocation is not supported by this browser');
                setLocationError(error.message);
                reject(error);
                return;
            }

            setIsGettingLocation(true);
            setLocationError(null);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newCoords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setCoordinates(newCoords);
                    setIsGettingLocation(false);
                    resolve(newCoords);
                },
                (error) => {
                    let errorMessage = 'Unable to get your location';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enable location permissions.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred.';
                    }
                    setLocationError(errorMessage);
                    setIsGettingLocation(false);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    return (
        <GetCurrentLocationContext.Provider value={{
            coordinates, 
            handleGetLocation,
            locationError,
            isGettingLocation,
            clearError: () => setLocationError(null)
        }}>
            {children}
        </GetCurrentLocationContext.Provider>
    );
}