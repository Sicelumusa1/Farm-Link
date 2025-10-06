
const { oracledb } = require('../config/db');

const Delivery = {
  // Create new delivery
  async create({ user_id, name, crop_id, address, date }) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `INSERT INTO deliveries (user_id, name, crop_id, address, date) 
         VALUES (:user_id, :name, :crop_id, :address, :date) 
         RETURNING id INTO :id`,
        {
          user_id,
          name,
          crop_id,
          address,
          date: new Date(date),
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

  // Find delivery by ID
  async findById(delivery_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT d.*, 
                c.crop_name,
                c.farm_id,
                f.name as farm_name,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone
         FROM deliveries d
         JOIN crops c ON d.crop_id = c.id
         JOIN farms f ON c.farm_id = f.id
         JOIN users u ON d.user_id = u.id
         WHERE d.id = :delivery_id`,
        { delivery_id },
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

  // Find all deliveries by user ID
  async findByUserId(user_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT d.*, 
                c.crop_name,
                f.name as farm_name,
                f.municipality,
                f.ward
         FROM deliveries d
         JOIN crops c ON d.crop_id = c.id
         JOIN farms f ON c.farm_id = f.id
         WHERE d.user_id = :user_id
         ORDER BY d.date DESC, d.created_at DESC`,
        { user_id },
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

  // Find all deliveries (for admin)
  async getAllDeliveries() {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT d.*, 
                c.crop_name,
                f.name as farm_name,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone
         FROM deliveries d
         JOIN crops c ON d.crop_id = c.id
         JOIN farms f ON c.farm_id = f.id
         JOIN users u ON d.user_id = u.id
         ORDER BY d.date DESC, d.created_at DESC`,
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

  // Update delivery details
  async update(delivery_id, { name, crop_id, address, date }) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const fields = [];
      const binds = { delivery_id };
      
      if (name !== undefined) {
        fields.push('name = :name');
        binds.name = name;
      }
      if (crop_id !== undefined) {
        fields.push('crop_id = :crop_id');
        binds.crop_id = crop_id;
      }
      if (address !== undefined) {
        fields.push('address = :address');
        binds.address = address;
      }
      if (date !== undefined) {
        fields.push('date = :date');
        binds.date = new Date(date);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `UPDATE deliveries SET ${fields.join(', ')} WHERE id = :delivery_id`;
      
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

  // Delete delivery
  async delete(delivery_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      await connection.execute(
        `DELETE FROM deliveries WHERE id = :delivery_id`,
        { delivery_id }
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

  // Get deliveries by crop ID
  async findByCropId(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT d.*, u.name as user_name, u.email as user_email
         FROM deliveries d
         JOIN users u ON d.user_id = u.id
         WHERE d.crop_id = :crop_id
         ORDER BY d.date DESC`,
        { crop_id },
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

  // Get deliveries by farm ID
  async findByFarmId(farm_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT d.*, c.crop_name, u.name as user_name
         FROM deliveries d
         JOIN crops c ON d.crop_id = c.id
         JOIN users u ON d.user_id = u.id
         WHERE c.farm_id = :farm_id
         ORDER BY d.date DESC`,
        { farm_id },
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

module.exports = Delivery;
