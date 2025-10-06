import '../styles/Services.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling, faBug, faSprayCan, faTractor } from '@fortawesome/free-solid-svg-icons'

export default function PrivateServices() {
  return (
    <div className="services-container" id="private-services">
      <div className="description-container">
        <h1 className="services-title">Private Farmer Services</h1>
        <p className="services-subtitle">Boost your farm with our additional support offerings</p>
      </div>

      <div className="services">
        <div className="service">
          <FontAwesomeIcon icon={faSeedling} className="icon"/>
          <h3>Organic Fertilizer</h3>
          <p>Locally produced, eco-friendly fertilizer to enrich your soil.</p>
        </div>

        <div className="service">
          <FontAwesomeIcon icon={faBug} className="icon"/>
          <h3>Organic Pesticides</h3>
          <p>Protect crops naturally with chemical-free pest control.</p>
        </div>

        <div className="service">
          <FontAwesomeIcon icon={faTractor} className="icon"/>
          <h3>Soil Preparation</h3>
          <p>Professional soil turning and conditioning for optimal yields.</p>
        </div>

        <div className="service">
          <FontAwesomeIcon icon={faSprayCan} className="icon"/>
          <h3>Pest Fumigation</h3>
          <p>Safe fumigation services to protect your farm from infestations.</p>
        </div>
      </div>
    </div>
  )
}
