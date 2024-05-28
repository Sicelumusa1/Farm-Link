import { useNavigate } from 'react-router-dom'
import '../styles/HeaderSignIn.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faGear, faUser, faBars } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';


/*
<div className="home-search-container">
  <FontAwesomeIcon icon={faMagnifyingGlass} className="searchIcon" />
  <input type="text" placeholder="Search..." />
</div>
*/
export default function HeaderSignIn() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  return (
    <div className="header_signin-container">
      <div className="logo_signin-container">
        <h1>FarmLink</h1>
      </div>
      <div className="header-nav">
        
      </div>
      {isMobile ? <FontAwesomeIcon icon={faBars} className="headerBar" onClick={() => setToggle((prev) => !prev)} /> : <div className="signin-wrapper">
        <div className="logout-btn-container">
          <div className="setting-container">
            <FontAwesomeIcon icon={faGear} className="settingsIcon"/>
            <p className="settings-title">Settings</p>
          </div>
          <div className="profile-container">
            <FontAwesomeIcon icon={faUser} className="profileIcon" />
            <p className="userName-title">User</p>
          </div>
          <div className="logout-container">
            <button onClick={() => {navigate('/login')}}>Logout</button>
          </div>
        </div>
      </div>}
      {toggle && (
        <div className="logout-btn-container-nav">
          <div className="setting-nav">
            <FontAwesomeIcon icon={faGear} className="settingsIconNav"/>
            <p className="settings-title-nav">Settings</p>
          </div>
          <div className="profile-container-nav">
            <FontAwesomeIcon icon={faUser} className="profileIconNav" />
            <p className="userName-title-nav">User</p>
          </div>
          <div className="logout-container-nav">
            <button onClick={() => {navigate('/login')}}>Logout</button>
          </div>
      </div>)}
    </div>
  )
}
