import React from 'react'
import '../styles/CropGuidelinesPopup.css'

const CropGuidelinesPopup = (crop, onClose) => {
  
  const guidelines = {
    Cabbage: {
      spacing: 'Row 500-900 mm, 300-600 mm within-row',
      fertilization: '2:3:4 fertilizer, nitrogen side dressing',
      irrigation: 'Regular and uniform soil moisture',
      pesticide: 'Regular spraying against major pests'
    },
    Tomato: {
      spacing: 'Row 500-900 mm, 300-600 mm within-row',
      fertilization: '2:3:4 fertilizer, nitrogen side dressing',
      irrigation: 'Regular and uniform soil moisture',
      pesticide: 'Regular spraying against major pests'
    },
  };

  const cropInfo = guidelines[crop];

  if (!cropInfo) {
    return null;
  }

  return (
    <div className='popup-overlay'>
      <div className="popup-content">
        <h3>{crop} Guidelines</h3>
        <div className="guidelile-section">
          <h4>spacing</h4>
          <p>{cropInfo.spacing}</p>
        </div>
        <div className="guidelile-section">
          <h4>Fertilization</h4>
          <p>{cropInfo.fertilization}</p>
        </div>
        <div className="guidelile-section">
          <h4>Irrigation</h4>
          <p>{cropInfo.irrigation}</p>
        </div>
        <div className="guidelile-section">
          <h4>Pesticide Application</h4>
          <p>{cropInfo.pesticide}</p>
        </div>
      </div>
    </div>
  )
}

export default CropGuidelinesPopup