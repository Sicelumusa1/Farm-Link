// import React from 'react';
// import '../styles/ProduceItem.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

// export default function ProduceItem({ crop, quantityL, selectedPlantDate, type }) {
  
//   return (
//     <div className="produceItem-container">
//       <div className="produceItem">
//         <FontAwesomeIcon icon={faAngleUp} className="produce-arrowIcon" />
//         <div className="produceName">
//           <p>{crop}</p>
//         </div>
//         <div className="produceQuantityContainer">
//           <div className="produceQuantityInput">{quantityL}</div>
//         </div>
//         <div className="produceDetails">
//           <p>Planted: {new Date(selectedPlantDate).toLocaleDateString()}</p>
//           <p>Type: {type}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from 'react';
import '../styles/ProduceItem.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function ProduceItem({ crop, quantityL, selectedPlantDate, type, produceYield }) {
  return (
    <div className="produceItem-container">
      <div className="produceItem">
        <div className="produceItem-details">
          <p>{crop}</p> {/* Crop Name */}
          <p>{new Date(selectedPlantDate).toLocaleDateString()}</p> {/* Planted Date */}
          <p>{type}</p> {/* Type (direct sow/transplant) */}
          <p>Planting</p> {/* Growth Stage (default) */}
          <p>{produceYield}</p> {/* Quantity Ready (Yield) */}
          <button className="remove-btn">
            <FontAwesomeIcon icon={faTrash} /> {/* Remove Icon */}
          </button>
        </div>
      </div>
    </div>
  );
}