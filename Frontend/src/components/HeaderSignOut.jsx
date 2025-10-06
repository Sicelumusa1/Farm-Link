import '../styles/HeaderSignOut.css'
import { useNavigate } from 'react-router-dom'

export default function HeaderSignOut() {
const navigate = useNavigate();

  return (
    <div className="header-container">
      <div className="logo-container">
        <h1>LEDPlug</h1>
      </div>
      <div className="wrapper">
        <div className="nav">
          <div className="home-link-container">
            <p>Services</p>
          </div>
          <div className="about_us-link-container">
            <p>About Us</p>
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
  )
}
