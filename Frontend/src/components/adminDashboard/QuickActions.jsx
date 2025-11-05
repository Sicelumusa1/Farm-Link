import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faChartLine, 
  faDownload, 
  faSync,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

export default function QuickActions({ theme, onAction }) {
  const actions = [
    {
      id: 'add_farmer',
      label: 'Add Farmer',
      icon: faPlus,
      description: 'Register new farmer',
      color: '#10B981'
    },
    {
      id: 'generate_report',
      label: 'Generate Report',
      icon: faChartLine,
      description: 'Create analytics report',
      color: '#3B82F6'
    },
    {
      id: 'export_data',
      label: 'Export Data',
      icon: faDownload,
      description: 'Export to CSV/Excel',
      color: '#8B5CF6'
    },
    {
      id: 'refresh_data',
      label: 'Refresh Data',
      icon: faSync,
      description: 'Update all data',
      color: '#6B7280'
    },
    {
      id: 'view_map',
      label: 'View Map',
      icon: faMapMarkerAlt,
      description: 'Farm locations map',
      color: '#EF4444'
    }
  ];

  const handleActionClick = (actionId) => {
    if (onAction) {
      onAction(actionId);
    }
    // You can add specific handlers for each action
    console.log(`Action clicked: ${actionId}`);
  };

  return (
    <div className={`quick-actions ${theme}`}>
      <h3 className="actions-title">Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`action-btn ${theme}`}
            onClick={() => handleActionClick(action.id)}
            style={{ '--action-color': action.color }}
          >
            <div className="action-icon">
              <FontAwesomeIcon icon={action.icon} />
            </div>
            <div className="action-content">
              <span className="action-label">{action.label}</span>
              <span className="action-description">{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

