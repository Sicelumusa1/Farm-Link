
// import './styles/App.css'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Landing from './pages/Landing'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import Home from './pages/Home'
// import ForgotPassword from './pages/ForgotPassword'
// import PasswordReset from './pages/PasswordReset'
// import HomeFarmer from './pages/HomeFarmer'
// import RecoveryEmail from './pages/RecoveryEmail'
// import DetailedAbout from './components/DetailedAbout'

// function App() {
//   //handles all the routing for the application.
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route index element={<Landing />} />
//         <Route path="/landing" element={<Landing />} />
//         <Route path="/about" element={<DetailedAbout />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/home" element={<Home />} />
//         <Route path="/home/farmer" element={<HomeFarmer />} />
//         <Route path="/forgotpassword" element={<ForgotPassword />} />
//         <Route path="/password/reset/:token" element={<PasswordReset />} />
//         <Route path="/recoveryemailsent" element={<RecoveryEmail />}/>
//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App

import './styles/App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import PasswordReset from './pages/PasswordReset'
import HomeFarmer from './pages/HomeFarmer'
import RecoveryEmail from './pages/RecoveryEmail'
import DetailedAbout from './components/DetailedAbout'

// Import providers
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { CurrentLocationProvider } from './contexts/CurrentLocationContext'
import { SelectedFarmerProvider } from './contexts/SelectedFarmerContext';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <CurrentLocationProvider>
          <SelectedFarmerProvider>
            <BrowserRouter>
              <Routes>
                <Route index element={<Landing />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/about" element={<DetailedAbout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/home/farmer" element={<HomeFarmer />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/password/reset/:token" element={<PasswordReset />} />
                <Route path="/recoveryemailsent" element={<RecoveryEmail />}/>
              </Routes>
            </BrowserRouter>
          </SelectedFarmerProvider> 
        </CurrentLocationProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App