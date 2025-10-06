
const { oracledb } = require('../config/db');

const Farm = {
  // Create new farm
  async create({ user_id, name, municipality, ward, latitude, longitude, city, farm_size }) {
    let connection;
    try {
      connection = await oracledb.getConnection('default');

      const result = await connection.execute(
        `INSERT INTO farms (user_id, name, municipality, ward, latitude, longitude, city, farm_size) 
         VALUES (:user_id, :name, :municipality, :ward, :latitude, :longitude, :city, :farm_size) 
         RETURNING id INTO :id`,
        {
          user_id,
          name,
          municipality,
          ward,
          latitude: latitude || null,
          longitude: longitude || null,
          city,
          farm_size,
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

  // Find farm by user ID
  async findByUserId(user_id) {
    let connection;
    try {
      connection = await oracledb.getConnection('default');
      const result = await connection.execute(
        `SELECT f.*, u.has_provided_farm_details
         FROM farms f 
         JOIN users u ON f.user_id = u.id 
         WHERE f.user_id = :user_id`,
        { user_id },
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

  // Update farm details
  async update(farmId, { name, municipality, ward, latitude, longitude, city, farm_size }) {
    let connection;
    try {
      connection = await oracledb.getConnection('default');

      await connection.execute(
        `UPDATE farms SET 
         name = :name, 
         municipality = :municipality, 
         ward = :ward, 
         latitude = :latitude, 
         longitude = :longitude, 
         city = :city, 
         farm_size = :farm_size 
         WHERE id = :id`,
        {
          name,
          municipality,
          ward,
          latitude,
          longitude,
          city,
          farm_size,
          id: farmId
        }
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

  // Get farm with crops and orders
  async getFarmWithCropsAndOrders(user_id) {
    let connection;
    try {
      connection = await oracledb.getConnection('default');

      // Get farm details
      const farmResult = await connection.execute(
        `SELECT * FROM farms WHERE user_id = :user_id`,
        { user_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!farmResult.rows || farmResult.rows.length === 0) {
        return null;
      }

      const farm = farmResult.rows[0];

      // Get crops for this farm
      const cropsResult = await connection.execute(
        `SELECT c.* FROM crops c WHERE c.farm_id = :farm_id`,
        { farm_id: farm.ID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      farm.CROPS = cropsResult.rows || [];

      // Get orders for each crop
      for (let crop of farm.CROPS) {
        const ordersResult = await connection.execute(
          `SELECT o.*, u.name as admin_name 
           FROM orders o 
           JOIN users u ON o.admin_id = u.id 
           WHERE o.crop_id = :crop_id`,
          { crop_id: crop.ID },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        crop.ORDERS = ordersResult.rows || [];
      }

      return farm;
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

  // Check if user already has a farm
  async userHasFarm(user_id) {
    let connection;
    try {
      connection = await oracledb.getConnection('default');
      const result = await connection.execute(
        `SELECT COUNT(*) as farm_count FROM farms WHERE user_id = :user_id`,
        { user_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0].FARM_COUNT > 0;
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

  // Find farms by name
  async findByName(farmName) {
    let connection;
    try {
      connection = await oracledb.getConnection('default');
      const result = await connection.execute(
        `SELECT f.*, u.name as farmer_name
       FROM farms f
       JOIN users u ON f.user_id = u.id
       WHERE f.name LIKE :farmName`,
        { farmName: `%${farmName}%` },
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

  // Get all farms with coordinates
  async getAllFarmsWithCoordinates() {
    let connection;
    try {
      connection = await oracledb.getConnection('default');
      const result = await connection.execute(
        `SELECT f.*, u.name as farmer_name
       FROM farms f
       JOIN users u ON f.user_id = u.id
       WHERE f.latitude IS NOT NULL AND f.longitude IS NOT NULL
       ORDER BY f.name`,
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
  }
};

module.exports = Farm;
