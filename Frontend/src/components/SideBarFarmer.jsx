/* eslint-disable react/prop-types */
import '../styles/SideBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWheatAwn, faGear, faUser } from '@fortawesome/free-solid-svg-icons'
import { useContext, useState } from 'react'
import { ThemeContext } from '../contexts/ThemeContext';

export default function SideBarFarmer({setNavItem, setSelectedItem}) {
  const [selected, setSelected] = useState(false);
  const { theme } = useContext(ThemeContext);

  const handleProfile = () => {
    setNavItem('profile');
    setSelected(false);
  }
  
  const handleSelected = () => {
    setSelected((prevState) => !prevState);
  }
  return (
    <div className={`sidebar-container ${theme}`}>
        <div className={!selected ? (`item-container 2 sidebarF ${theme}`) : (`item-container2 2 ${theme}`)} onClick={handleProfile}>
          <FontAwesomeIcon icon={faUser} className="icon" />
          <p className="item-title profile">Profile</p>
        </div>
        <div className={`item-container 1 ${theme}`} onClick={() => setNavItem('produce')}>
          <FontAwesomeIcon icon={faWheatAwn} className="icon" />
          <p className="item-title produce">Produce</p>
        </div>
        <div className={`sidebar-settings-wrapper ${theme}`}>
          <div className={`item-container-settings ${theme} item-container ${theme}`} onClick={() => setNavItem('settings')}>
            <FontAwesomeIcon icon={faGear} className="icon"/>
            <p className="item-title schedule">Settings</p>
          </div>
        </div>
    </div>
  )
}
