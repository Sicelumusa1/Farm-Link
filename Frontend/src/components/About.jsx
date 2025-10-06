import '../styles/AboutUs.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLeaf, faTruck, faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'

export default function About() {
  
  const navigate = useNavigate();

  const createCarouselItems = () => {
    const items = [];
    // Add one active card
    items.push({ name: "Alfred Duma", farms: 200, active: true });
    // Add 5 empty cards
    for (let i = 0; i < 5; i++) {
      items.push({ name: "", farms: 0, active: false });
    }
    return items;
  };

  const carouselItems = createCarouselItems();

  return (
    <div className="about-container" id="aboutUs">
      <div className="about-header">
        <h1 className="about-title">LEDPlug</h1>
        <p className="about-subtitle">Connecting farmers with buyers through innovative technology</p>
        <button className="learn-more-btn" onClick={() => navigate("/about")}>Learn More</button>
      </div>

      <div className="about-features">
        <div className="feature">
          <FontAwesomeIcon icon={faLeaf} className="feature-icon"/>
          <h3>Farm Management</h3>
          <p>Manage your farm details, crops, and production data easily</p>
        </div>

        <div className="feature">
          <FontAwesomeIcon icon={faTruck} className="feature-icon"/>
          <h3>Order System</h3>
          <p>Streamlined ordering process connecting farmers with buyers</p>
        </div>

        <div className="feature">
          <FontAwesomeIcon icon={faUsers} className="feature-icon"/>
          <h3>Community</h3>
          <p>Join a growing community of farmers and professionals</p>
        </div>

        <div className="feature">
          <FontAwesomeIcon icon={faChartLine} className="feature-icon"/>
          <h3>Analytics</h3>
          <p>Track your farm's performance and growth over time</p>
        </div>
      </div>

      {/* Municipalities Carousel Section */}
      <div className="municipalities-section">
        <h2 className="municipalities-title">Pilot Program: Alfred Duma Municipality</h2>
        <p className="municipalities-subtitle">Currently serving 200+ farms with more regions coming soon</p>
        
        <div className="carousel-container">
          <div className="carousel-track">
            {/* First set - only one Alfred Duma */}
            {carouselItems.map((item, index) => (
              <div key={index} className={`municipality-card ${item.active ? 'active' : 'inactive'}`}>
                <div className="municipality-icon">
                  {item.active ? '' : ''}
                </div>
                <h4>{item.active ? item.name : 'Coming Soon'}</h4>
                <p>{item.active ? `${item.farms}+ farms` : 'Future Expansion'}</p>
              </div>
            ))}
            {/* Duplicate set - same pattern */}
            {carouselItems.map((item, index) => (
              <div key={`dup-${index}`} className={`municipality-card ${item.active ? 'active' : 'inactive'}`}>
                <div className="municipality-icon">
                  {item.active ? '' : ''}
                </div>
                <h4>{item.active ? item.name : 'Coming Soon'}</h4>
                <p>{item.active ? `${item.farms}+ farms` : 'Future Expansion'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="about-stats">
        <div className="stat">
          <h3>200+</h3>
          <p>Active Farms</p>
        </div>
        <div className="stat">
          <h3>1K+</h3>
          <p>Orders Processed</p>
        </div>
        <div className="stat">
          <h3>98%</h3>
          <p>Satisfaction Rate</p>
        </div>
      </div>
    </div>
  )
}