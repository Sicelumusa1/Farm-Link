import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import '../styles/ForgotPassword.css'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../services/authService'
import { useState } from 'react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //sends password reset link to specified email
      const data = await forgotPassword({ email });
      navigate('/recoveryemailsent');
    } catch (err) {
      console.log(err.message);
    }
  }
  return (
    <div className="forgotPassword">
      <h1 className="logo-forget-password">LEDPlug</h1>
      <form className="forgot-password-email-container" onSubmit={handleSubmit}>
        <h1 className="forgot-password-title">Forgot Password</h1>
        <input type="email" className="email-input-container"  placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="reset-password-btn" type="submit">Reset Password</button>
        <div className="back-to-login">
          <FontAwesomeIcon icon={faArrowLeft} className="BackIcon" />
          <p className="back-to-login-link" onClick={() => navigate('/login')}>Back to Login</p>
        </div>
        <p className="last-link">Don't have an account? <span className="register-link-forgot" onClick={() => navigate('/register')}>Register</span></p>
      </form>
    </div>
  )
}
