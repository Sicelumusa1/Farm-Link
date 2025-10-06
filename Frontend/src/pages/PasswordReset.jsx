import { useState } from 'react'
import '../styles/PasswordReset.css'
import axiosInstance from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';


export default function PasswordReset() {
  const [password, setPassword] = useState('');
  const [comfirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password == comfirmPassword) {
        const response = await axiosInstance.put(`api/v1/password/reset/${token}`, {password});
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
        <input type="password" className="confirm-password-input-container" value={comfirmPassword}  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter Password" required />
        <button className="create-password-btn" type="submit">Create Password</button>
      </form>
    </div>
  )
}
