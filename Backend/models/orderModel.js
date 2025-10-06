const { oracledb } = require('../config/db');

const Order = {
  // Create new order
  async create({ admin_id, crop_id, quantity, status = 'pending' }) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `INSERT INTO orders (admin_id, crop_id, quantity, status) 
         VALUES (:admin_id, :crop_id, :quantity, :status) 
         RETURNING id INTO :id`,
        {
          admin_id,
          crop_id,
          quantity,
          status,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );

      await connection.commit();
      return result.outBinds.id[0];
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Find order by ID
  async findById(order_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT o.*, 
                c.crop_name,
                c.farm_id,
                f.name as farm_name,
                f.user_id as farmer_id,
                u_admin.name as admin_name,
                u_farmer.name as farmer_name
         FROM orders o
         JOIN crops c ON o.crop_id = c.id
         JOIN farms f ON c.farm_id = f.id
         JOIN users u_admin ON o.admin_id = u_admin.id
         JOIN users u_farmer ON f.user_id = u_farmer.id
         WHERE o.id = :order_id`,
        { order_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0];
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Update order status
  async updateStatus(order_id, status) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      await connection.execute(
        `UPDATE orders SET status = :status WHERE id = :order_id`,
        { status, order_id }
      );

      await connection.commit();
      return true;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Update order details
  async update(order_id, { quantity, status }) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const fields = [];
      const binds = { order_id };
      
      if (quantity !== undefined) {
        fields.push('quantity = :quantity');
        binds.quantity = quantity;
      }
      if (status !== undefined) {
        fields.push('status = :status');
        binds.status = status;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `UPDATE orders SET ${fields.join(', ')} WHERE id = :order_id`;
      
      await connection.execute(query, binds);
      await connection.commit();
      
      return true;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Delete order
  async delete(order_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      await connection.execute(
        `DELETE FROM orders WHERE id = :order_id`,
        { order_id }
      );

      await connection.commit();
      return true;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Get all orders with detailed information (for admin)
  async getAllOrders() {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT 
            o.id as order_id,
            o.quantity,
            o.status,
            o.created_at as date_issued,
            c.id as crop_id,
            c.crop_name,
            f.id as farm_id,
            f.name as farm_name,
            u_farmer.id as farmer_id,
            u_farmer.name as farmer_name,
            u_admin.name as admin_name
         FROM orders o
         JOIN crops c ON o.crop_id = c.id
         JOIN farms f ON c.farm_id = f.id
         JOIN users u_farmer ON f.user_id = u_farmer.id
         JOIN users u_admin ON o.admin_id = u_admin.id
         ORDER BY o.created_at DESC`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Get orders by admin ID
  async findByAdminId(admin_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT o.*, c.crop_name, f.name as farm_name, u.name as farmer_name
         FROM orders o
         JOIN crops c ON o.crop_id = c.id
         JOIN farms f ON c.farm_id = f.id
         JOIN users u ON f.user_id = u.id
         WHERE o.admin_id = :admin_id
         ORDER BY o.created_at DESC`,
        { admin_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // Get orders by farmer ID (user who owns the farm)
  async findByFarmerId(farmer_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT o.*, c.crop_name, f.name as farm_name, u.name as admin_name
         FROM orders o
         JOIN crops c ON o.crop_id = c.id
         JOIN farms f ON c.farm_id = f.id
         JOIN users u ON o.admin_id = u.id
         WHERE f.user_id = :farmer_id
         ORDER BY o.created_at DESC`,
        { farmer_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};

module.exports = Order;
