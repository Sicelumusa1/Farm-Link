import '../styles/AboutUs.css'

export default function AboutUs() {
  return (
    <div className="about-container" id="aboutUs">
      <div className="about-header">
        <h1>About AphelPhem</h1>
        <p className="tagline">
          Transforming government service delivery through innovative technology solutions 
          that drive efficiency, accountability, and measurable impact.
        </p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2>Who We Are</h2>
          <p>
            <span className="company-name">AphelPhem</span> is a forward-thinking technology startup 
            dedicated to empowering government departments to exceed their service delivery mandates. 
            We specialize in building intelligent digital platforms that streamline complex administrative 
            processes, freeing officials to focus on their core mission: serving citizens directly in communities.
          </p>
        </div>

        <div className="about-section">
          <h2>What We Do</h2>
          <ul>
            <li>
              <strong>Enterprise Digital Platforms:</strong> Custom-built solutions that optimize workflows, 
              enhance collaboration, and provide real-time visibility into service delivery impact.
            </li>
            <li>
              <strong>Advanced Data Analytics:</strong> Transform raw data into actionable intelligence with 
              dynamic dashboards that reveal performance trends, bottlenecks, and opportunities for improvement.
            </li>
            <li>
              <strong>Cloud & DevOps Excellence:</strong> Secure, scalable infrastructure solutions built on 
              modern cloud architectures that grow with your department's evolving needs.
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Expertise</h2>
          <p>
            Our team brings together cutting-edge technical skills with deep public sector understanding:
          </p>
          <ul>
            <li>
              <strong>Fullstack Development & Cloud Architecture:</strong> Certified experts in building 
              robust, scalable applications that meet government security and compliance standards.
            </li>
            <li>
              <strong>DevOps & Kubernetes Specialization:</strong> CKAD-certified professionals delivering 
              seamless CI/CD pipelines and container orchestration for maximum reliability.
            </li>
            <li>
              <strong>Data-Driven Decision Making:</strong> Certified data analysts who transform complex 
              government data into clear, actionable insights for leadership and field teams.
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            To become South Africa's premier technology partner for government innovation, driving 
            measurable improvements in service delivery through digital transformation that puts 
            citizen needs at the center of everything we do.
          </p>
        </div>

        {/* Optional stats section - uncomment if you want to add metrics */}
        {/* <div className="about-stats">
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Government Focused</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Platform Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Years Combined Experience</div>
          </div>
        </div> */}
      </div>
    </div>
  )
}
