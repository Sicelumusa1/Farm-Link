import '../styles/DetailedAbout.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'
import { 
  faArrowLeft, 
  faCheck, 
  faSeedling, 
  faTruck, 
  faChartBar, 
  faShieldAlt,
  faUsers,
  faGlobe,
  faHandHoldingHeart
} from '@fortawesome/free-solid-svg-icons'

export default function DetailedAbout() {

  const navigate = useNavigate();

  return (
    <div className="detailed-about-container" id="about-detailed">
      <button className="back-btn" onClick={() => {navigate('/landing')}}>
         Back
      </button>

      <div className="detailed-header">
        <h1>About LED Plug Platform</h1>
        <p>A comprehensive digital ecosystem for modern agriculture</p>
      </div>

      <div className="mission-vision">
        <div className="mission">
          <h2>Our Mission</h2>
          <p>To empower farmers with technology that simplifies farm management and expands market access.</p>
          <div className="mission-steps">
            <div className="step">
              <FontAwesomeIcon icon={faCheck} className="check-icon"/>
              <span>Digital Transformation</span>
            </div>
            <div className="step">
              <FontAwesomeIcon icon={faCheck} className="check-icon"/>
              <span>Supply Chain Optimization</span>
            </div>
            <div className="step">
              <FontAwesomeIcon icon={faCheck} className="check-icon"/>
              <span>Community Building</span>
            </div>
            <div className="step">
              <FontAwesomeIcon icon={faCheck} className="check-icon"/>
              <span>Sustainability Focus</span>
            </div>
          </div>
        </div>

        <div className="vision">
          <h2>Our Vision</h2>
          <p>Create the world's most connected agricultural ecosystem for equal opportunities.</p>
          <div className="vision-goals">
            <div className="goal">
              <FontAwesomeIcon icon={faUsers} className="goal-icon"/>
              <span>Connect 10,000+ farmers by 2025</span>
            </div>
            <div className="goal">
              <FontAwesomeIcon icon={faGlobe} className="goal-icon"/>
              <span>Reduce supply chain waste by 40%</span>
            </div>
            <div className="goal">
              <FontAwesomeIcon icon={faHandHoldingHeart} className="goal-icon"/>
              <span>Promote sustainable practices</span>
            </div>
          </div>
        </div>
      </div>

      <div className="platform-features">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-detail">
            <FontAwesomeIcon icon={faSeedling} className="feature-detail-icon"/>
            <h3>Farm Management</h3>
            <ul>
              <li>Complete farm profile management</li>
              <li>Crop tracking and yield monitoring</li>
              <li>Soil health integration</li>
              <li>Inventory planning</li>
            </ul>
          </div>

          <div className="feature-detail">
            <FontAwesomeIcon icon={faTruck} className="feature-detail-icon"/>
            <h3>Order System</h3>
            <ul>
              <li>Automated order processing</li>
              <li>Real-time delivery tracking</li>
              <li>Route optimization</li>
              <li>Multi-farm coordination</li>
            </ul>
          </div>

          <div className="feature-detail">
            <FontAwesomeIcon icon={faChartBar} className="feature-detail-icon"/>
            <h3>Analytics</h3>
            <ul>
              <li>Production analytics dashboard</li>
              <li>Market trend analysis</li>
              <li>Yield prediction models</li>
              <li>Financial tracking</li>
            </ul>
          </div>

          <div className="feature-detail">
            <FontAwesomeIcon icon={faShieldAlt} className="feature-detail-icon"/>
            <h3>Security</h3>
            <ul>
              <li>Enterprise-grade data protection</li>
              <li>Regular automated backups</li>
              <li>99.9% uptime guarantee</li>
              <li>Role-based access control</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="technology">
        <h2>Technology Stack</h2>
        <div className="tech-tags">
          <span className="tech-tag">React.js</span>
          <span className="tech-tag">Node.js</span>
          <span className="tech-tag">Express.js</span>
          <span className="tech-tag">RESTful APIs</span>
          <span className="tech-tag">Oracle Database</span>
          <span className="tech-tag">Docker</span>
          <span className="tech-tag">Kubernetes</span>
          <span className="tech-tag">Ansible</span>
          <span className="tech-tag">Terraform</span>
          <span className="tech-tag">OCI</span>
        </div>
      </div>

      <div className="impact-stats">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="impact-stat">
            <h3>75%</h3>
            <p>Reduction in Order Processing Time</p>
          </div>
          <div className="impact-stat">
            <h3>2.5x</h3>
            <p>Increase in Farmer Income</p>
          </div>
          <div className="impact-stat">
            <h3>60%</h3>
            <p>Decrease in Food Waste</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Join the Agricultural Revolution</h2>
        <p>Be part of the community transforming agriculture through technology</p>
        <button className="cta-btn" onClick={() => {navigate('/register')}}>Get Started Today</button>
      </div>
    </div>
  )
}