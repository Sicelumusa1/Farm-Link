/* eslint-disable react/prop-types */
import '../styles/SideBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWheatAwn, faGear, faSunPlantWilt, faLineChart, faMoneyBills } from '@fortawesome/free-solid-svg-icons'
import { useContext, useState } from 'react'
import { ThemeContext } from '../contexts/ThemeContext';

export default function SideBarFarmer({setNavItem}) {
  const [selected, setSelected] = useState(false);
  const { theme } = useContext(ThemeContext);

  const handleProfile = () => {
    setNavItem('profile');
    setSelected(false);
  }
  
  return (
    <div className={`sidebar-container ${theme}`}>
        <div className={!selected ? (`item-container 2 sidebarF ${theme}`) : (`item-container2 2 ${theme}`)} onClick={handleProfile}>
          <FontAwesomeIcon icon={faSunPlantWilt} className="icon" />
          <p className="item-title profile"> Farm Profile</p>
        </div>
        <div className={`item-container 1 ${theme}`} onClick={() => setNavItem('produce')}>
          <FontAwesomeIcon icon={faWheatAwn} className="icon" />
          <p className="item-title produce">Produce</p>
        </div>
        <div className={`item-container 1 ${theme}`} onClick={() => setNavItem('analytics')}>
          <FontAwesomeIcon icon={faLineChart} className="icon" />
          <p className="item-title produce">Analytics</p>
        </div>
        <div className={`item-container 1 ${theme}`} onClick={() => setNavItem('finance')}>
          <FontAwesomeIcon icon={faMoneyBills} className="icon" />
          <p className="item-title produce">Finances</p>
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
