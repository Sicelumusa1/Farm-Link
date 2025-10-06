
import '../styles/Services.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faChartSimple, faBoxesPacking, faFileSignature, faLeaf, faTruck } from '@fortawesome/free-solid-svg-icons'

export default function Services() {
  return (
    <div className="services-container" id="services">
      <div className="description-container">
        <h1 className="services-title">Our Services</h1>
      </div>

      {/* Municipality Services */}
      <h2 className="audience-title">For Municipalities</h2>
      <div className="services">
        <div className="service">
          <FontAwesomeIcon icon={faUsers} className="icon"/>
          <h3>Farmer Registry</h3>
          <p>Track farmers, crops, growth stages, and harvest dates.</p>
        </div>
        <div className="service">
          <FontAwesomeIcon icon={faFileSignature} className="icon"/>
          <h3>Order Management</h3>
          <p>Assign or auto-distribute buyer orders among farmers.</p>
        </div>
        <div className="service">
          <FontAwesomeIcon icon={faChartSimple} className="icon"/>
          <h3>Impact Tracking</h3>
          <p>Monitor farmer performance, ward-level data, and generate reports.</p>
        </div>
      </div>

      {/* Farmer Services */}
      <h2 className="audience-title">For Farmers</h2>
      <div className="services">
        <div className="service">
          <FontAwesomeIcon icon={faLeaf} className="icon"/>
          <h3>Farm Profile</h3>
          <p>Register farm details and update production progress.</p>
        </div>
        <div className="service">
          <FontAwesomeIcon icon={faBoxesPacking} className="icon"/>
          <h3>Market Access</h3>
          <p>Receive and fulfill orders fairly and transparently.</p>
        </div>
        <div className="service">
          <FontAwesomeIcon icon={faTruck} className="icon"/>
          <h3>Order Tracking</h3>
          <p>Follow order status from assignment to dispatch.</p>
        </div>
      </div>
    </div>
  )
}
