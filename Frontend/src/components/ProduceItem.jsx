import React from 'react';
import '../styles/ProduceItem.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function ProduceItem({ crop, quantityL, selectedPlantDate, type, produceYield }) {
  return (
    <div className="produceItem-container">
      <div className="produceItem">
        <div className="produceItem-details">
          <p>{crop}</p>
          <p>{new Date(selectedPlantDate).toLocaleDateString()}</p> 
          <p>{type}</p>
          <p>Planting</p>
          <p>{produceYield}</p>
          <button className="remove-btn">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
}