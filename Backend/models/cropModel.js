const { oracledb } = require('../config/db');

class Crop {
  // Static methods for unit conversions
  static getUnitConversions() {
    return {
      'kg': {
        baseUnit: 'kg',
        conversionFactor: 1,
        displayName: 'kilograms',
        category: 'weight'
      },
      'heads': {
        baseUnit: 'kg',
        conversionFactor: 4, // Average cabbage head weight
        displayName: 'heads',
        category: 'count'
      },
      'bags_10kg': {
        baseUnit: 'kg',
        conversionFactor: 10,
        displayName: '10kg bags',
        category: 'weight'
      },
      'bags_7kg': {
        baseUnit: 'kg',
        conversionFactor: 7,
        displayName: '7kg bags',
        category: 'weight'
      },
      'crates': {
        baseUnit: 'kg',
        conversionFactor: 20, // Standard crate weight
        displayName: 'crates',
        category: 'volume'
      },
      'units': {
        baseUnit: 'kg',
        conversionFactor: 4, // Average pumpkin/butternut weight
        displayName: 'units',
        category: 'count'
      },
      'bunches': {
        baseUnit: 'kg',
        conversionFactor: 0.5, // Average spinach/kale bunch weight
        displayName: 'bunches',
        category: 'count'
      }
    };
  }

  static getRecommendedUnits(cropName) {
    const unitRecommendations = {
      'Cabbage': ['heads', 'kg'],
      'Lettuce': ['heads', 'kg'],
      'Potato': ['bags_10kg', 'bags_7kg', 'kg'],
      'Onion': ['bags_10kg', 'bags_7kg', 'kg'],
      'Tomato': ['crates', 'kg'],
      'Carrot': ['kg'],
      'Pumpkin': ['units', 'kg'],
      'Butternut': ['units', 'kg'],
      'Spinach': ['bunches', 'kg'],
      'Kale': ['bunches', 'kg'],
      'Brinjal': ['kg'],
      'Pepper': ['kg'],
      'Beetroot': ['kg']
    };

    return unitRecommendations[cropName] || ['kg'];
  }

  static convertToKg(quantity, unit) {
    const conversions = this.getUnitConversions();
    const conversion = conversions[unit] || conversions['kg'];
    return quantity * conversion.conversionFactor;
  }

  static convertFromKg(quantityInKg, unit) {
    const conversions = this.getUnitConversions();
    const conversion = conversions[unit] || conversions['kg'];
    return quantityInKg / conversion.conversionFactor;
  }

  static getUnitDisplayName(unit) {
    const conversions = this.getUnitConversions();
    return conversions[unit]?.displayName || unit;
  }

  // Database operations
  static async create({ farm_id, crop_name, plant_date, type, units_planted, produce_yield = 0, unit_of_measure = 'kg', unit_conversion_factor = 1 }) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

      const result = await connection.execute(
        `INSERT INTO crops (farm_id, crop_name, plant_date, type, units_planted, produce_yield, unit_of_measure, unit_conversion_factor) 
         VALUES (:farm_id, :crop_name, :plant_date, :type, :units_planted, :produce_yield, :unit_of_measure, :unit_conversion_factor) 
         RETURNING id INTO :id`,
        {
          farm_id,
          crop_name,
          plant_date,
          type,
          units_planted,
          produce_yield,
          unit_of_measure,
          unit_conversion_factor,
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
  }

  // Find crop by ID
  static async findById(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
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
  }

  // Find all crops by farm ID
  static async findByFarmId(farm_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
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
  }

  // Update crop details
  static async update(crop_id, { crop_name, plant_date, type, units_planted, produce_yield, growth_stage, unit_of_measure, unit_conversion_factor }) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

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
      if (unit_of_measure !== undefined) {
        fields.push('unit_of_measure = :unit_of_measure');
        binds.unit_of_measure = unit_of_measure;
      }
      if (unit_conversion_factor !== undefined) {
        fields.push('unit_conversion_factor = :unit_conversion_factor');
        binds.unit_conversion_factor = unit_conversion_factor;
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
  }

  // Delete crop
  static async delete(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

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
  }

// Image operations

  static async addCropImage(crop_id, image_url, description = null, growth_stage = null) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

      const result = await connection.execute(
        `INSERT INTO crop_images (crop_id, image_url, description, growth_stage, created_at) 
       VALUES (:crop_id, :image_url, :description, :growth_stage, CURRENT_TIMESTAMP) 
       RETURNING id INTO :id`,
        {
          crop_id,
          image_url,
          description,
          growth_stage,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );

      await connection.commit();
      return result.outBinds.id[0];
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  static async getCropImages(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      const result = await connection.execute(
        `SELECT * FROM crop_images 
       WHERE crop_id = :crop_id 
       ORDER BY created_at DESC`,
        { crop_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  static async updateCropImage(crop_id, image_id, description, growth_stage) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

      await connection.execute(
        `UPDATE crop_images 
       SET description = :description, growth_stage = :growth_stage 
       WHERE id = :image_id AND crop_id = :crop_id`,
        { description, growth_stage, image_id, crop_id }
      );

      await connection.commit();
      return true;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  static async deleteCropImage(crop_id, image_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

      await connection.execute(
        `DELETE FROM crop_images WHERE id = :image_id AND crop_id = :crop_id`,
        { image_id, crop_id }
      );

      await connection.commit();
      return true;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Get crop with orders and deliveries
  static async getCropWithOrdersAndDeliveries(crop_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

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
  }

  // Update crop growth stage
  static async updateGrowthStage(crop_id, growth_stage) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

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
  }

  // Get crops by user ID (all crops for user's farms)
  static async findByUserId(user_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
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


  // Get available crops with their units
  static async getAvailableCrops() {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      const result = await connection.execute(
        `SELECT DISTINCT 
                c.crop_name,
                c.unit_of_measure,
                c.unit_conversion_factor,
                SUM(c.produce_yield) as total_availability,
                COUNT(DISTINCT f.id) as farm_count
         FROM crops c
         JOIN farms f ON c.farm_id = f.id
         JOIN users u ON f.user_id = u.id
         WHERE u.role = 'user'
           AND c.produce_yield > 0
         GROUP BY c.crop_name, c.unit_of_measure, c.unit_conversion_factor
         ORDER BY c.crop_name`,
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

  // Update crop unit information
  static async updateCropUnit(crop_id, unit_of_measure, unit_conversion_factor) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

      await connection.execute(
        `UPDATE crops SET unit_of_measure = :unit_of_measure, unit_conversion_factor = :unit_conversion_factor 
         WHERE id = :crop_id`,
        { unit_of_measure, unit_conversion_factor, crop_id }
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
  }

  static async findByIdWithUser(crop_id, user_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

      const result = await connection.execute(
        `SELECT c.*
         FROM crops c
         JOIN farms f ON c.farm_id = f.id
         JOIN users u ON f.user_id = u.id
        WHERE c.id = :crop_id
          AND u.id = :user_id`,
        { crop_id, user_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }


  // Convert crop quantity to different unit
  static async convertCropQuantity(crop_id, new_unit) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");

      // Get current crop data
      const cropResult = await connection.execute(
        `SELECT produce_yield, unit_of_measure, unit_conversion_factor 
         FROM crops WHERE id = :crop_id`,
        { crop_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!cropResult.rows || cropResult.rows.length === 0) {
        throw new Error('Crop not found');
      }

      const crop = cropResult.rows[0];
      const currentUnit = crop.UNIT_OF_MEASURE;
      const currentQuantity = crop.PRODUCE_YIELD;

      // Convert to kg first
      const quantityInKg = currentQuantity * crop.UNIT_CONVERSION_FACTOR;

      // Get conversion factor for new unit
      const conversions = this.getUnitConversions();
      const newConversion = conversions[new_unit];

      if (!newConversion) {
        throw new Error(`Unsupported unit: ${new_unit}`);
      }

      // Convert from kg to new unit
      const newQuantity = quantityInKg / newConversion.conversionFactor;

      // Update crop with new unit and quantity
      await connection.execute(
        `UPDATE crops SET 
          produce_yield = :new_quantity,
          unit_of_measure = :new_unit,
          unit_conversion_factor = :conversion_factor
         WHERE id = :crop_id`,
        {
          new_quantity: newQuantity,
          new_unit: new_unit,
          conversion_factor: newConversion.conversionFactor,
          crop_id: crop_id
        }
      );

      await connection.commit();
      return {
        original_quantity: currentQuantity,
        original_unit: currentUnit,
        new_quantity: newQuantity,
        new_unit: new_unit
      };
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
  }
}

module.exports = Crop;