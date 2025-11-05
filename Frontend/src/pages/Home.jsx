// import '../styles/Home.css'
// import HeaderSignIn from '../components/HeaderSignIn'
// import SideBar from '../components/SideBar'
// import Members from '../components/Members'
// import { useContext } from 'react'
// import Orders from '../components/Orders'
// import { ThemeContext } from '../contexts/ThemeContext';
// import '../styles/Members.css'
// import ListOrders from '../components/ListOrders'
// import Settings from '../components/Settings'
// import PlaceDelivery from '../components/PlaceDelivery'
// import { SidebarContext } from '../contexts/SideBarContext'
// import { SelectedFarmerContext } from '../contexts/SelectedFarmerContext'
// import AutoOrder from '../components/AutoOrder'
// import '../styles/Members.css'


// export default function Home() {
//   const { theme } = useContext(ThemeContext);
//   const { navItem } = useContext(SidebarContext);
//   const { selectedFarmer, showOrderForm, setShowOrderForm } = useContext(SelectedFarmerContext)

//   return (
//     <div className={`home-container ${theme}`}>
//       <div className="home-header-container">
//         {<HeaderSignIn />}
//       </div>
//       <div className="main-content-container">
//         {<SideBar />}
//         {selectedFarmer && showOrderForm && (
//           <Orders user={selectedFarmer} />)}
//         {navItem === 'order' && !showOrderForm && selectedFarmer === null &&  <Orders />}
//         {navItem === 'members' && !showOrderForm &&  (
//           <Members 
//             showOrderForm={showOrderForm}
//             setShowOrderForm={setShowOrderForm}
//             />)}
//         {navItem === 'listOrders' && <ListOrders />}
//         {navItem === 'delivery' && <PlaceDelivery />}
//         {navItem === 'autoOrder' && <AutoOrder />}
//         {navItem === 'settings' && <Settings />}
//       </div>
//     </div>
//   )
// }

import '../styles/Home.css'
import HeaderSignIn from '../components/HeaderSignIn'
import SideBar from '../components/SideBar'
import Members from '../components/Members'
import { useContext } from 'react'
import Orders from '../components/Orders'
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/Members.css'
import ListOrders from '../components/ListOrders'
import Settings from '../components/Settings'
import PlaceDelivery from '../components/PlaceDelivery'
import { SidebarContext } from '../contexts/SideBarContext'
import { useSelectedFarmer } from '../contexts/SelectedFarmerContext'
import AutoOrder from '../components/AutoOrder'
import '../styles/Members.css'

export default function Home() {
  const { theme } = useContext(ThemeContext);
  const { navItem } = useContext(SidebarContext);
  const { selectedFarmer, showOrderForm } = useSelectedFarmer()

  return (
    <div className={`home-container ${theme}`}>
      <div className="home-header-container">
        {<HeaderSignIn />}
      </div>
      <div className="main-content-container">
        {<SideBar />}
        {selectedFarmer && showOrderForm && (
          <Orders user={selectedFarmer} />)}
        {navItem === 'order' && !showOrderForm && selectedFarmer === null &&  <Orders />}
        {navItem === 'members' && !showOrderForm &&  <Members />}
        {navItem === 'listOrders' && <ListOrders />}
        {navItem === 'delivery' && <PlaceDelivery />}
        {navItem === 'autoOrder' && <AutoOrder />}
        {navItem === 'settings' && <Settings />}
      </div>
    </div>
  )
}