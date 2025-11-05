import React, { useContext, useEffect, useState } from 'react';
import '../styles/ListOrder.css';
import '../styles/History.css';
import { getOrders, updateOrderStatus, updateOrder, deleteOrder } from '../services/OrderService';
import { ThemeContext } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function ListOrders() {
  const [selected, setSelected] = useState();
  const [orders, setOrders] = useState([]);
  const { theme } = useContext(ThemeContext);
  const [sortBy, setSortBy] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchData();
  }, []);

  const handleReceive = async (orderId, index) => {
    const confirmed = window.confirm('Have you received this order?');
    if (!confirmed) return;

    try {
      const updatedOrder = await updateOrderStatus(orderId, 'received');
      setOrders(prevOrders => {
        const newOrders = [...prevOrders];
        newOrders[index].status = 'received';
        return newOrders;
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleEdit = (index, quantity) => {
    setEditingIndex(index);
    setEditQuantity(quantity);
  };

  const handleSave = async (orderId, index) => {
    if (!editQuantity || isNaN(editQuantity) || editQuantity <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    try {
      await updateOrder(orderId, { quantity: editQuantity });
      setOrders(prevOrders => {
        const updated = [...prevOrders];
        updated[index].quantity = editQuantity;
        return updated;
      });
      setEditingIndex(null);
      setEditQuantity('');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order quantity.');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditQuantity('');
  };

  const handleDelete = async (orderId, index) => {
    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    try {
      await deleteOrder(orderId);
      setOrders(prevOrders => prevOrders.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order.');
    }
  };

  return (
    <div className="list-orders-container">
      <div className="list-orders-wrapper">
        <div className={`orders-list-title ${theme}`}>
          <h1>Orders</h1>
        </div>

        <div className={`list-orders-nav-container ${theme}`}>
          <div className={`order-history-container2 ${theme}`} onClick={() => setSelected('history')}>
            <p className={`order-history-title ${theme}`}>History</p>
          </div>
        </div>

        <div className="list-sort-wrapper">
          <div className="list-order-sort-container">
            <div className="list-order-sort-by-btn-contain">
              <button
                className={`list-order-sort-by-container ${theme}`}
                onClick={() => setSortBy(prev => !prev)}
              >
                Sort By
              </button>
            </div>
            {sortBy && (
              <div className={`list-order-sort-extent ${theme}`}>
                <div className={`list-order-sort-options ${theme}`}>
                  <p>Default</p>
                  <p>Name (asc)</p>
                  <p>Crop (asc)</p>
                  <p>Availability</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`list-order-history-table-container ${theme}`}>
          <table>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Farm Name</th>
                <th>Crop Name</th>
                <th>Quantity (kg)</th>
                <th>Date Issued</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className={`list-order-history-table-tr ${theme}`}>
                  <td>{order.farmerDetails.name}</td>
                  <td>{order.farmDetails.name}</td>
                  <td>{order.cropDetails.cropName}</td>

                  {/* Editable Quantity */}
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      `${order.quantity} kg`
                    )}
                  </td>

                  <td>{new Date(order.dateIssued).toLocaleDateString()}</td>

                  <td>
                    {order.status === 'dispatched' ? (
                      <button
                        onClick={() => handleReceive(order._id, index)}
                        className={`list-orders-dispatch-btn ${theme}`}
                      >
                        Dispatched
                      </button>
                    ) : (
                      <button
                        className={
                          order.status === 'received'
                            ? `list-orders-dispatched-btn ${theme}`
                            : order.status === 'pending'
                            ? `list-orders-panding-btn ${theme}`
                            : ''
                        }
                        disabled
                      >
                        {order.status}
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="action-icons">
                    {order.status === 'pending' && (
                      <>
                        {editingIndex === index ? (
                          <>
                            <FontAwesomeIcon
                              icon={faSave}
                              className="icon save-icon"
                              title="Save"
                              onClick={() => handleSave(order._id, index)}
                            />
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="icon cancel-icon"
                              title="Cancel"
                              onClick={handleCancelEdit}
                            />
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="icon edit-icon"
                              title="Edit Quantity"
                              onClick={() => handleEdit(index, order.quantity)}
                            />
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="icon delete-icon"
                              title="Cancel Order"
                              onClick={() => handleDelete(order._id, index)}
                            />
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
