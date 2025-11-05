import { useState } from 'react'
import '../styles/PasswordReset.css'
import axiosInstance from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ResetPassword } from '../services/authService';


export default function PasswordReset() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password == confirmPassword) {
        const response = await ResetPassword(token, { password });
        navigate('/login'); //redirects on success
      }
    } catch (err) {
      console.log(err.message);
    }
  }
  return (
    <div className="passwordReset">
      <h1 className="logo-reset-password">LEDPlug</h1>
      <form className="password-reset-container" onSubmit={handleSubmit}>
        <h1 className="create-password-title">Create New Password</h1>
        <input type="password" className="reset-password-input-container" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" required />
        <input type="password" className="confirm-password-input-container" value={confirmPassword}  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter Password" required />
        <button className="create-password-btn" type="submit">Create Password</button>
      </form>
    </div>
  )
}
