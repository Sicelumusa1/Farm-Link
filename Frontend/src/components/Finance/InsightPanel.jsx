// import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

// const InsightPanel = ({ insights }) => {
//   if (!insights || insights.length === 0) return null;

//   return (
//     <div className="advisory-insights">
//       <FontAwesomeIcon icon={faLightbulb} className="icon" />
//       <h4>Smart Insights</h4>
//       <ul>
//         {insights.map((tip, i) => (
//           <li key={i}>{tip}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default InsightPanel;
import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faCircleCheck, 
  faTriangleExclamation, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import '../../styles/InsightPanel.css';

const InsightPanel = ({ insights }) => {
  const { theme } = useContext(ThemeContext);

  if (!insights || insights.length === 0) return null;

  const getInsightType = (insight) => {
    if (insight.toLowerCase().includes('save') || insight.toLowerCase().includes('profit')) 
      return 'success';
    if (insight.toLowerCase().includes('warning') || insight.toLowerCase().includes('high')) 
      return 'warning';
    if (insight.toLowerCase().includes('alert') || insight.toLowerCase().includes('low')) 
      return 'error';
    return 'info';
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return faCircleCheck;
      case 'warning': return faTriangleExclamation;
      case 'error': return faTriangleExclamation;
      default: return faLightbulb;
    }
  };

  return (
    <div className={`advisory-insights ${theme}`}>
      <div className="insight-header">
        <FontAwesomeIcon icon={faLightbulb} className="icon" />
        <h4>Farm Insights</h4>
      </div>
      <ul>
        {insights.map((tip, i) => {
          const type = getInsightType(tip);
          return (
            <li key={i} className={`insight-${type}`}>
              <FontAwesomeIcon icon={getIcon(type)} className="insight-icon" />
              {tip}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InsightPanel;
