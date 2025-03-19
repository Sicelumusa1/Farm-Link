import '../styles/Home.css'
import HeaderSignIn from '../components/HeaderSignIn'
import { useContext, useEffect, useState } from 'react'
import Profile from '../components/Profile'
import SideBarFarmer from '../components/SideBarFarmer'
import Produce from '../components/Produce'
import Settings from '../components/Settings'
import { ThemeContext } from '../contexts/ThemeContext'
import { UserContext } from '../contexts/UserContext'
import { FarmPopUp } from '../components/FarmPopUp'

export default function HomeFarmer() {
  const [navItem, setNavItem] = useState('profile');
  const { theme } = useContext(ThemeContext);
  const [popUp, setPopUp] = useState(false);
  const { user } = useContext(UserContext);
  const [coordinates, setCoordinates] = useState({ "latitude": "", "longitude": ""});
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    // Fetch use data and check if farm details have been provided
    const fetchUserData = async () => {
      try {
        const userData = await profile();
        if (userData.data && !userData.data.hasProvidedFarmDetails) {
          setPopUp(true); // Show popup if farm details are not provided
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleGetLocation = () => {
    //Pops up prompt for allowing App to get user's current location
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
      enableHighAccuracy: true
    })
  }
    
  const successLocation = (position) => {
    //Set state of coordinates when Allow current location is accepted
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
    if (longitude && latitude) {
      setCoordinates({"latitude": latitude, "longitude": longitude});
    } 
  }

  const errorLocation = (error) => {
    /*handles an error with getting current location,
     or user disagrees to allow App to get user's current Location.*/
    console.log(error) //test
  }
  //console.log(user)
  return (
    <div className={`home-container ${theme}`}>
      <div className="home-header-container">
        {<HeaderSignIn />}
      </div>
      <div className="main-content-container">
        {handleGetLocation()}
        {user && !user.farm  && popUp && <FarmPopUp setPopUp={setPopUp} coordinates={coordinates}/>}
        {<SideBarFarmer setNavItem={setNavItem} />}
        {navItem === 'profile' && <Profile handleGetLocation={handleGetLocation} coordinates={coordinates} />}
        {navItem === 'produce' && <Produce />}
        {navItem === 'settings' && <Settings />}
      </div>
    </div>
  )
}
