import { useContext, useState } from 'react'
import '../styles/Members.css'
import History from './History';
import Details from './Details';
import { ThemeContext } from '../contexts/ThemeContext';

export default function Profile({handleGetLocation, coordinates}) {
  const [selected, setSelected] = useState('history');
  const { theme } = useContext(ThemeContext);
  const [reRender, setReRender] = useState(false);

  return (
    <div className={`members-container ${theme}`}>
      <div className={`members-wrapper ${theme}`}>
        <div className={`members-title ${theme}`}>
          <h1 className={`members-title-title ${theme}`}>Profile</h1>
        </div>
        <div className={`members-nav-container ${theme}`}>
          {<div className={selected == 'history' ? (`recent-container2 ${theme}`) : (`recent-container ${theme}`)} onClick={() => setSelected('history')}>
            <p className={`members-recent-title ${theme}`}> Order History</p>
          </div>}
          {<div className={selected == 'details' ? (`application-container2 ${theme}`) : (`application-container ${theme}`)} onClick={() => setSelected('details')}>
            <p className={`members-application-title ${theme}`}>Profile Details</p>
          </div>}
        </div>
        {selected == 'history' && <History />}
        {selected == 'details' && !reRender &&
          <Details
            handleGetLocation={handleGetLocation}
            coordinates={coordinates}
            setReRender={setReRender}/>}
        {selected == 'details' && reRender &&
          <Details
            handleGetLocation={handleGetLocation}
            coordinates={coordinates}
            setReRender={setReRender}/>}
      </div>
    </div>
  )
}
