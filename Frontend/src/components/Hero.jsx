import React from 'react'
import '../styles/Hero.css'
import { useNavigate } from 'react-router-dom'
import HeaderCarousel from './Carousel';

export default function Hero() {

  const navigate = useNavigate();

  return (
    <div className="hero-container">
        <HeaderCarousel />
        <div className="hero-wrapper">
            <div className="title-container">
                <h1 className="title">Empowering... Revolutionizing Agriculture</h1>
            </div>
            <div className="description-container">
                <p className="description">Link the future of farming with us.</p>
            </div>
            <div className="hero-btn-container">
                <button className="get_started-btn" onClick={() => navigate("/register")}>Get started</button>
                <button className="learn_more-btn" onClick={() => navigate("/about")}>Learn More</button>
            </div>
        </div>
    </div>
  )
}
