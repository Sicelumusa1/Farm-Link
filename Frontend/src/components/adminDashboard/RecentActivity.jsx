import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSeedling, 
  faUserPlus, 
  faChartLine, 
  faMapMarkerAlt,
  faClock 
} from '@fortawesome/free-solid-svg-icons';

export default function RecentActivity({ theme }) {
  const activities = [
    {
      id: 1,
      type: 'crop_update',
      farmer: 'John Kamau',
      crop: 'Maize',
      action: 'updated availability',
      value: '150 kg',
      time: '2 hours ago',
      icon: faSeedling
    },
    {
      id: 2,
      type: 'new_farmer',
      farmer: 'Sarah Wanjiku',
      action: 'registered new farm',
      location: 'Ward 5',
      time: '5 hours ago',
      icon: faUserPlus
    },
    {
      id: 3,
      type: 'yield_report',
      farmer: 'Peter Mwangi',
      crop: 'Beans',
      action: 'reported harvest',
      value: '200 kg',
      time: '1 day ago',
      icon: faChartLine
    },
    {
      id: 4,
      type: 'visit',
      farmer: 'Admin User',
      action: 'conducted farm visit',
      location: 'Ward 3',
      time: '2 days ago',
      icon: faMapMarkerAlt
    }
  ];

  return (
    <div className={`recent-activity ${theme}`}>
      <h3 className="activity-title">
        <FontAwesomeIcon icon={faClock} className="title-icon" />
        Recent Activity
      </h3>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className={`activity-item ${theme}`}>
            <div className="activity-icon">
              <FontAwesomeIcon icon={activity.icon} />
            </div>
            <div className="activity-content">
              <p className="activity-text">
                <strong>{activity.farmer}</strong> {activity.action}
                {activity.crop && ` for ${activity.crop}`}
                {activity.value && `: ${activity.value}`}
                {activity.location && ` in ${activity.location}`}
              </p>
              <span className="activity-time">
                <FontAwesomeIcon icon={faClock} /> {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}