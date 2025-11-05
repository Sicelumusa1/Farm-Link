import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getOrdersByStatus, deleteOrder } from '../../services/OrderService';
import '../../styles/MarketplaceOverview.css'

export default function OrdersManagement({ theme }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    buyer: ''
  });
  const [showOrders, setShowOrders] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      
      // Transform orders data for display
      const transformedOrders = ordersData.data?.map(order => ({
        id: order._id || order.id,
        orderNumber: order.orderNumber || `ORD-${order._id?.slice(-6)}`,
        buyerName: order.buyer?.name || order.buyerName || 'Unknown Buyer',
        buyerContact: order.buyer?.phone || order.buyerContact || 'N/A',
        cropName: order.crop?.cropName || order.cropName || 'Unknown Crop',
        quantity: order.quantity || 0,
        pricePerKg: order.pricePerKg || 0,
        totalAmount: order.totalAmount || 0,
        status: order.status?.toLowerCase() || 'pending',
        orderDate: order.createdAt || order.orderDate,
        deliveryDate: order.deliveryDate,
        deliveryMethod: order.deliveryMethod || 'pickup',
        farmerName: order.farmer?.name || order.farmerName || 'Unknown Farmer',
        farmName: order.farm?.name || order.farmName || 'Unknown Farm'
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    if (filters.buyer) {
      filtered = filtered.filter(order => 
        order.buyerName.toLowerCase().includes(filters.buyer.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setActionLoading(orderId);
      await updateOrderStatus(orderId, newStatus);
      
      // Refresh orders after successful update
      await fetchOrders();
      
      // Show success message (you can integrate with a toast notification)
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      // Show error message
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setActionLoading(orderId);
        await deleteOrder(orderId);
        
        // Refresh orders after successful deletion
        await fetchOrders();
        
        console.log(`Order ${orderId} deleted successfully`);
      } catch (error) {
        console.error('Error deleting order:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning' },
      confirmed: { label: 'Confirmed', color: 'info' },
      processing: { label: 'Processing', color: 'info' },
      shipped: { label: 'Shipped', color: 'info' },
      delivered: { label: 'Delivered', color: 'success' },
      completed: { label: 'Completed', color: 'success' },
      cancelled: { label: 'Cancelled', color: 'error' },
      rejected: { label: 'Rejected', color: 'error' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'neutral' };
    return (
      <span className={`status-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['completed']
    };
    
    return statusFlow[currentStatus] || [];
  };

  if (!showOrders) {
    return (
      <div className={`orders-minimized ${theme}`}>
        <div className="minimized-header">
          <h3>Orders Management</h3>
          <button 
            className={`toggle-section-btn ${theme}`}
            onClick={() => setShowOrders(true)}
          >
            Show Orders
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`orders-loading ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading orders data...</p>
      </div>
    );
  }

  return (
    <div className={`orders-management ${theme}`}>
      <div className="orders-header">
        <div className="orders-header-main">
          <h3>Orders Management</h3>
          <p>Manage and track all marketplace orders</p>
        </div>
        <button 
          className={`toggle-section-btn ${theme}`}
          onClick={() => setShowOrders(false)}
        >
          Hide Orders
        </button>
      </div>

      {/* Quick Filters */}
      <div className={`orders-filters ${theme}`}>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by buyer name..."
            value={filters.buyer}
            onChange={(e) => setFilters(prev => ({ ...prev, buyer: e.target.value }))}
            className={`search-input ${theme}`}
          />
        </div>
        <div className="filter-group">
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={`filter-select ${theme}`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button 
          className={`clear-filters-btn ${theme}`}
          onClick={() => setFilters({ status: '', buyer: '' })}
        >
          Clear Filters
        </button>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Buyer</th>
              <th>Crop</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Farmer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="order-row">
                <td className="order-number">{order.orderNumber}</td>
                <td className="buyer-info">
                  <div className="buyer-name">{order.buyerName}</div>
                  <div className="buyer-contact">{order.buyerContact}</div>
                </td>
                <td className="crop-info">{order.cropName}</td>
                <td className="quantity">{order.quantity} kg</td>
                <td className="amount">KSh {order.totalAmount?.toLocaleString()}</td>
                <td className="status">
                  {getStatusBadge(order.status)}
                </td>
                <td className="order-date">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="farmer-info">
                  <div className="farmer-name">{order.farmerName}</div>
                  <div className="farm-name">{order.farmName}</div>
                </td>
                <td className="actions">
                  <div className="action-buttons">
                    <button 
                      className="action-btn view"
                      onClick={() => console.log('View order:', order.id)}
                    >
                      View
                    </button>
                    
                    {/* Status Update Buttons */}
                    {getNextStatus(order.status).map(nextStatus => (
                      <button
                        key={nextStatus}
                        className={`action-btn ${nextStatus}`}
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? '...' : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                      </button>
                    ))}
                    
                    {/* Delete Button for Admin */}
                    {['pending', 'cancelled'].includes(order.status) && (
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? '...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders-message">
          <p>No orders found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}