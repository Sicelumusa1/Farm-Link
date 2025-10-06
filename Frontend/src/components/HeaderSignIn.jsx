import { useNavigate } from 'react-router-dom'
import '../styles/HeaderSignIn.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faBars } from '@fortawesome/free-solid-svg-icons'
import { useContext, useEffect, useState } from 'react';
import { profile } from '../services/ProfileService';
import { ThemeContext } from '../contexts/ThemeContext';
import { Logout } from '../services/authService';


export default function HeaderSignIn() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
  const [toggle, setToggle] = useState(false);
  const [user, setUser] = useState();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await profile();
        setUser(data.data);
      } catch(err) {
        console.log(err);
      }
    } 
    fetchData();
  }, [])

  const handleLogout = async () => {
    try {
        const data = await Logout();
        navigate('/login')
      } catch(err) {
        console.log(err);
      }
  }

  return (
    <div className={`header_signin-container ${theme}`}>
      <div className={`logo_signin-container ${theme}`}>
        <h1 className={`logo_signin-title-container ${theme}`}>LEDPlug</h1>
      </div>
      <div className="header-nav">
        
      </div>
      {isMobile ? <FontAwesomeIcon icon={faBars} className="headerBar" onClick={() => setToggle((prev) => !prev)} /> : <div className="signin-wrapper">
        <div className="logout-btn-container">
          <div className={`profile-container ${theme}`}>
            <FontAwesomeIcon icon={faUser} className={`profileIcon ${theme}`} />
            <p className={`userName-title ${theme}`}>{user && user.name}</p>
          </div>
          <div className={`logout-container ${theme}`}>
            <button className={`logout-btn-container ${theme}`} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>}
      {toggle && (
        <div className="logout-btn-container-nav">
          <div className="profile-container-nav">
            <FontAwesomeIcon icon={faUser} className="profileIconNav" />
            <p className="userName-title-nav">{user && user.name}</p>
          </div>
          <div className="logout-container-nav">
            <button onClick={() => handleLogout}>Logout</button>
          </div>
      </div>)}
    </div>
  )
}
