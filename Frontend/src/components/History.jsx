import { useContext, useEffect, useState } from 'react';
import '../styles/History.css';
import { getFarmerOrders, updateOrderStatus } from '../services/OrderService';
import { ThemeContext } from '../contexts/ThemeContext';

export default function History() {
  const [select, setSelect] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getFarmerOrders();
        const ordersData = Array.isArray(response.data) ? response.data : response;

        if (Array.isArray(ordersData)) {
          const formatted = ordersData.map(order => ({
            _id: order._id,
            cropName: order.cropDetails?.cropName || order.cropName || 'Unknown Crop',
            quantity: order.quantity,
            date: order.createdAt || order.dateIssued,
            status: order.status || 'pending',
          }));
          setOrders(formatted);
        } else {
          setError('Unexpected data format received.');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // --- handle status update helper
  const handleStatusChange = async (index, newStatus, confirmationMessage) => {
    const order = orders[index];
    const confirmed = window.confirm(confirmationMessage);
    if (!confirmed) return;

    try {
      setUpdatingId(order._id);
      setError(null);
      await updateOrderStatus(order._id, newStatus);

      setOrders(prev => {
        const updated = [...prev];
        updated[index].status = newStatus;
        return updated;
      });
    } catch (error) {
      console.error('Order status update failed:', error);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  const filteredOrders = select
    ? orders.filter(order => order.status === select)
    : orders;

  const getStatusLabelClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-label pending';
      case 'acknowledged':
        return 'status-label acknowledged';
      case 'dispatched':
        return 'status-label dispatched';
      case 'delivered':
        return 'status-label delivered';
      default:
        return 'status-label';
    }
  };

  return (
    <div className="history-container">
      <div className="header-history-containers">
        <h1>My Orders</h1>
      </div>

      {error && (
        <div className={`error-message ${theme}`}>
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Filter */}
      <div className={`status-filter-container ${theme}`}>
        <label>Filter by Status: </label>
        <select
          value={select}
          onChange={(e) => setSelect(e.target.value)}
          className={`status-select ${theme}`}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className={`history-table-container ${theme}`}>
        {filteredOrders.length === 0 ? (
          <div className="no-orders-message">
            No orders found for this filter.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Quantity (kg)</th>
                <th>Date Issued</th>
                <th>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order._id || index}>
                  <td>{order.cropName}</td>
                  <td>{order.quantity}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    {order.status === 'pending' && (
                      <button
                        disabled={updatingId === order._id}
                        className="action-btn acknowledge"
                        onClick={() =>
                          handleStatusChange(index, 'acknowledged', 'Confirm that you have received this order?')
                        }
                      >
                        {updatingId === order._id ? 'Updating...' : 'Acknowledge'}
                      </button>
                    )}

                    {order.status === 'acknowledged' && (
                      <button
                        disabled={updatingId === order._id}
                        className="action-btn dispatch"
                        onClick={() =>
                          handleStatusChange(index, 'dispatched', 'Confirm that this order has been dispatched?')
                        }
                      >
                        {updatingId === order._id ? 'Updating...' : 'Mark as Dispatched'}
                      </button>
                    )}

                    {(order.status === 'dispatched' || order.status === 'delivered') && (
                      <span className={getStatusLabelClass(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

