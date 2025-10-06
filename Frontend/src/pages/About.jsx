import Footer from '../components/Footer'
import Services from '../components/Services'
import led from '../assets/images/Farmlink_imgs/LEDPlug.svg'
import { useNavigate } from 'react-router-dom'
import DetailedAbout from '../components/DetailedAbout'
import About from '../components/About'
import Login from './Login'
import Register from './Register'



export default function AboutDetails() {
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
      {<DetailedAbout />}
      {<Footer />}
    </>
  )
}
