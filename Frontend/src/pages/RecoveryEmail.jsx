import '../styles/RecoveryEmail.css'
import { useNavigate } from 'react-router-dom';

export default function RecoveryEmail() {
    const navigate = useNavigate();
  return (
    <div className="recovery-email-container">
      <h1 className="logo-recovery-email">LEDPlug</h1>
      <div className="recovery-email-sent-container">
        <div className="sent-email-mes-containter">
            <h1 className="recovery-email-title">Reset your password</h1>
            <div className="sent-email-mes">
                <p className="sent-email-mes-p">Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.</p>
                <div className="back-to-login-recovery">
                    <p className="back-to-login-sent-link" onClick={() => navigate('/login')}>Back to Login</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
