const { oracledb } = require('../config/db');

const Crop = {
  // Create new crop
  async create({ farm_id, crop_name, plant_date, type, units_planted, produce_yield = 0 }) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `INSERT INTO crops (farm_id, crop_name, plant_date, type, units_planted, produce_yield) 
         VALUES (:farm_id, :crop_name, :plant_date, :type, :units_planted, :produce_yield) 
         RETURNING id INTO :id`,
        {
          farm_id,
          crop_name,
          plant_date,
          type,
          units_planted,
          produce_yield,
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

  // Find crop by ID
  async findById(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT c.*, f.name as farm_name, f.user_id
         FROM crops c 
         JOIN farms f ON c.farm_id = f.id 
         WHERE c.id = :crop_id`,
        { crop_id },
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

  // Find all crops by farm ID
  async findByFarmId(farm_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM orders o WHERE o.crop_id = c.id) as order_count
         FROM crops c 
         WHERE c.farm_id = :farm_id 
         ORDER BY c.plant_date DESC`,
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
  },

  // Update crop details
  async update(crop_id, { crop_name, plant_date, type, units_planted, produce_yield, growth_stage }) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const fields = [];
      const binds = { crop_id };
      
      if (crop_name !== undefined) {
        fields.push('crop_name = :crop_name');
        binds.crop_name = crop_name;
      }
      if (plant_date !== undefined) {
        fields.push('plant_date = :plant_date');
        binds.plant_date = plant_date;
      }
      if (type !== undefined) {
        fields.push('type = :type');
        binds.type = type;
      }
      if (units_planted !== undefined) {
        fields.push('units_planted = :units_planted');
        binds.units_planted = units_planted;
      }
      if (produce_yield !== undefined) {
        fields.push('produce_yield = :produce_yield');
        binds.produce_yield = produce_yield;
      }
      if (growth_stage !== undefined) {
        fields.push('growth_stage = :growth_stage');
        binds.growth_stage = growth_stage;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `UPDATE crops SET ${fields.join(', ')} WHERE id = :crop_id`;
      
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

  // Delete crop
  async delete(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      await connection.execute(
        `DELETE FROM crops WHERE id = :crop_id`,
        { crop_id }
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

  // Get crop with orders and deliveries
  async getCropWithOrdersAndDeliveries(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      // Get crop details
      const cropResult = await connection.execute(
        `SELECT c.*, f.name as farm_name, f.user_id
         FROM crops c 
         JOIN farms f ON c.farm_id = f.id 
         WHERE c.id = :crop_id`,
        { crop_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!cropResult.rows || cropResult.rows.length === 0) {
        return null;
      }

      const crop = cropResult.rows[0];

      // Get orders for this crop
      const ordersResult = await connection.execute(
        `SELECT o.*, u.name as admin_name 
         FROM orders o 
         JOIN users u ON o.admin_id = u.id 
         WHERE o.crop_id = :crop_id 
         ORDER BY o.created_at DESC`,
        { crop_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      crop.ORDERS = ordersResult.rows || [];

      // Get deliveries for this crop
      const deliveriesResult = await connection.execute(
        `SELECT d.*, u.name as user_name 
         FROM deliveries d 
         JOIN users u ON d.user_id = u.id 
         WHERE d.crop_id = :crop_id 
         ORDER BY d.date DESC`,
        { crop_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      crop.DELIVERIES = deliveriesResult.rows || [];

      return crop;
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

  // Update crop growth stage
  async updateGrowthStage(crop_id, growth_stage) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      await connection.execute(
        `UPDATE crops SET growth_stage = :growth_stage WHERE id = :crop_id`,
        { growth_stage, crop_id }
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

  // Get crops by user ID (all crops for user's farms)
  async findByUserId(user_id) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT c.*, f.name as farm_name, f.municipality, f.ward
         FROM crops c 
         JOIN farms f ON c.farm_id = f.id 
         WHERE f.user_id = :user_id 
         ORDER BY c.plant_date DESC`,
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
  }
};

module.exports = Crop;
