import Footer from '../components/Footer'
import HeaderSignOut from '../components/HeaderSignOut'
import Hero from '../components/Hero'
import MidBit from '../components/MidBit'
import Services from '../components/Services'
import Team from '../components/Team'
import led from '../assets/images/Farmlink_imgs/LED_Plug.svg'
import '../styles/HeaderSignOut.css'
import { useNavigate } from 'react-router-dom'
import PrivateServices from '../components/PrivateServices'
import About from '../components/About'

export default function Landing() {
  const navigate = useNavigate();
  return (
    <>
      <div className="header-container">
        <div className="logo-container">
          <img src={led} alt="LEDPlug Logo" className="logo" />
          <h3 className="logo-text">LEDPlug</h3>
        </div>
        <div className="wrapper">
          <div className="nav">
            <div className="home-link-container">
              <a href="#services">Services</a>
            </div>
            <div className="about_us-link-container">
              <a href="#aboutUs">About Us</a>
            </div>
          </div>
          <div className="login_register-btn-container">
            <div className="login-container">
              <button onClick={() => {navigate('/login')}}>Login</button>
            </div>
            <div className="register-container">
              <button onClick={() => {navigate('/register')}}>Register</button>
            </div>
          </div>
        </div>
      </div>
      {<Hero />}
      {<Services />}
      {<MidBit />}
      {/* <PrivateServices /> */}
      {<About />}
      {<Footer />}
    </>
  )
}
