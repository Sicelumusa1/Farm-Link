import { Link, useNavigate } from 'react-router-dom'
import '../styles/Register.css'
import { registerUser } from '../services/authService';
import { useState } from 'react';


export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    //handles when the form is submited (Register button is pressed)
    //form input values (ex.Name) etc will be retrieved and sent to the backend from here.
    event.preventDefault();
    try {
      const data = await registerUser({ name, email, password, phone, location, farmSize });
      navigate("/login") //navigates to the successful registration if successful
    } catch (err) {
      console.log(err.message);
    }
    
  }
  
  return (
    <div className="outer-register-container">
      <div className="registerContainer">
        <div className="image-container">
          <div className="registration-spacer"></div>
          <div className="title_slogan-container">
            <h1 className="FarmLink-title">LEDPlug</h1>
            <p className="Farmlink-slogans">Link the future of farming with us</p>
            <button className="back-btn" onClick={() => navigate("/")}>Back</button>
          </div>
          
        </div>

        <div className="input-container">
          <div className="input-spacer"></div>
          <div className="input-content-container">
            <div className="register-title">
              <h1>Hello</h1>
              <p>Join Us</p>
            </div>

            <form className='form-container' onSubmit={handleSubmit}>

              <div className="name-container">
                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required/>
              </div>
              
              <div className="email-container-r">
                <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required/>
              </div>

              <div className="password-container-r">
                <input type="text" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" required/>
              </div>

              <div className="phone-container">
                <input type="number" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" required/>
              </div>

              <div className="location-container">
                <input type="text" name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" required/>
              </div>

              <div className="farm-size-container">
                <input type="number" name="farm-size" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} placeholder="Farm Size/ha" required/>
              </div>

              <div className="submit-btn-container">
                <button className="registration-btn">Register</button>
              </div>
  
              <div className="registration-links">
                <div className="login-link-container">
                  <Link className="login-link" to="/login">Already have an account? <span className="clickable-login">Login</span></Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
