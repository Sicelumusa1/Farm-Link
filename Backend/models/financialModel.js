const { oracledb } = require('../config/db');

class FinancialTransaction {
  // Database operations
  static async create({ farm_id, type, crop_id, category, amount, description, transaction_date, created_by }) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      const result = await connection.execute(
        `INSERT INTO farm_transactions 
          (farm_id, type, crop_id, category, amount, description, transaction_date, created_by) 
         VALUES (:farm_id, :type, :crop_id, :category, :amount, :description, TO_DATE(:transaction_date, 'YYYY-MM-DD'), :created_by) 
         RETURNING id INTO :id`,
        {
          farm_id,
          type,
          crop_id: crop_id || null,
          category,
          amount,
          description,
          transaction_date,
          created_by,
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

  // Find transaction by ID
  static async findById(transaction_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      const result = await connection.execute(
        `SELECT t.*, c.crop_name, f.name as farm_name
         FROM farm_transactions t
         LEFT JOIN crops c ON t.crop_id = c.id
         JOIN farms f ON t.farm_id = f.id
         WHERE t.id = :transaction_id`,
        { transaction_id },
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

  static async findByIdWithUser(transaction_id, user_id) {
  let connection;
  try {
    connection = await oracledb.getConnection("default");

    const result = await connection.execute(
      `SELECT t.*
         FROM financial_transactions t
         JOIN farms f ON t.farm_id = f.id
         JOIN users u ON f.user_id = u.id
        WHERE t.id = :transaction_id
          AND u.id = :user_id`,
      { transaction_id, user_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || null;
  } finally {
    if (connection) await connection.close();
  }
}


  // Find all transactions by farm ID
  static async findByFarmId(farm_id, filters = {}) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      let query = `
        SELECT t.*, c.crop_name 
        FROM farm_transactions t
        LEFT JOIN crops c ON t.crop_id = c.id
        WHERE t.farm_id = :farm_id
      `;
      const binds = { farm_id };

      // Apply filters
      if (filters.type) {
        query += ' AND t.type = :type';
        binds.type = filters.type;
      }

      if (filters.crop_id) {
        query += ' AND t.crop_id = :crop_id';
        binds.crop_id = filters.crop_id;
      }

      if (filters.start_date) {
        query += ' AND t.transaction_date >= TO_DATE(:start_date, \'YYYY-MM-DD\')';
        binds.start_date = filters.start_date;
      }

      if (filters.end_date) {
        query += ' AND t.transaction_date <= TO_DATE(:end_date, \'YYYY-MM-DD\')';
        binds.end_date = filters.end_date;
      }

      if (filters.category) {
        query += ' AND t.category = :category';
        binds.category = filters.category;
      }

      query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

      if (filters.limit) {
        query += ' FETCH FIRST :limit ROWS ONLY';
        binds.limit = parseInt(filters.limit);
      }

      const result = await connection.execute(
        query, 
        binds, 
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

  // Update transaction details
  static async update(transaction_id, farm_id, updateData) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      const fields = [];
      const binds = { transaction_id, farm_id };
      
      if (updateData.category !== undefined) {
        fields.push('category = :category');
        binds.category = updateData.category;
      }
      if (updateData.amount !== undefined) {
        fields.push('amount = :amount');
        binds.amount = updateData.amount;
      }
      if (updateData.description !== undefined) {
        fields.push('description = :description');
        binds.description = updateData.description;
      }
      if (updateData.transaction_date !== undefined) {
        fields.push('transaction_date = TO_DATE(:transaction_date, \'YYYY-MM-DD\')');
        binds.transaction_date = updateData.transaction_date;
      }
      if (updateData.crop_id !== undefined) {
        fields.push('crop_id = :crop_id');
        binds.crop_id = updateData.crop_id || null;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `UPDATE farm_transactions SET ${fields.join(', ')} WHERE id = :transaction_id AND farm_id = :farm_id`;
      
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

  // Delete transaction
  static async delete(transaction_id, farm_id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      await connection.execute(
        `DELETE FROM farm_transactions WHERE id = :transaction_id AND farm_id = :farm_id`,
        { transaction_id, farm_id }
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

  // Get financial summary
  static async getFinancialSummary(farm_id, timeframe = 'this-month') {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      const dateFilter = FinancialTransaction.getDateFilter(timeframe);
      
      const query = `
        SELECT 
          type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM farm_transactions 
        WHERE farm_id = :farm_id ${dateFilter}
        GROUP BY type
      `;

      const result = await connection.execute(
        query, 
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

  // Get crop profitability
  static async getCropProfitability(farm_id, crop_id = null) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      let query = `
        SELECT 
          c.id as crop_id,
          c.crop_name,
          NVL(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
          NVL(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expenses,
          NVL(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as profit
        FROM crops c
        LEFT JOIN farm_transactions t ON c.id = t.crop_id AND t.farm_id = :farm_id
        WHERE c.farm_id = :farm_id
      `;

      const binds = { farm_id };

      if (crop_id) {
        query += ' AND c.id = :crop_id';
        binds.crop_id = crop_id;
      }

      query += ' GROUP BY c.id, c.crop_name ORDER BY profit DESC';

      const result = await connection.execute(
        query, 
        binds, 
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

  // Get expense breakdown
  static async getExpenseBreakdown(farm_id, timeframe = 'this-month') {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      const dateFilter = FinancialTransaction.getDateFilter(timeframe);
      
      const result = await connection.execute(
        `SELECT 
          category,
          SUM(amount) as total,
          COUNT(*) as count
         FROM farm_transactions 
         WHERE farm_id = :farm_id AND type = 'expense' ${dateFilter}
         GROUP BY category
         ORDER BY total DESC`,
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

  // Get monthly trends
  static async getMonthlyTrends(farm_id, year) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      
      const result = await connection.execute(
        `SELECT 
          EXTRACT(MONTH FROM transaction_date) as month,
          type,
          SUM(amount) as total
         FROM farm_transactions 
         WHERE farm_id = :farm_id AND EXTRACT(YEAR FROM transaction_date) = :year
         GROUP BY EXTRACT(MONTH FROM transaction_date), type
         ORDER BY month, type`,
        { farm_id, year: parseInt(year) },
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

  // Helper method for date filtering
  static getDateFilter(timeframe) {
    switch (timeframe) {
      case 'today':
        return "AND TRUNC(transaction_date) = TRUNC(SYSDATE)";
      case 'this-week':
        return "AND transaction_date >= TRUNC(SYSDATE, 'IW')";
      case 'this-month':
        return "AND transaction_date >= TRUNC(SYSDATE, 'MM')";
      case 'this-quarter':
        return "AND transaction_date >= TRUNC(SYSDATE, 'Q')";
      case 'this-year':
        return "AND transaction_date >= TRUNC(SYSDATE, 'YEAR')";
      default:
        return "AND transaction_date >= TRUNC(SYSDATE, 'MM')";
    }
  }

  // Get transaction categories
  static getTransactionCategories() {
    return {
      expense: [
        'Seeds', 'Fertilizers', 'Pesticides', 'Irrigation', 'Equipment',
        'Labor - Planting', 'Labor - Harvesting', 'Labor - Maintenance',
        'Fuel', 'Repairs', 'Utilities', 'Land Rent', 'Insurance', 'Transport'
      ],
      income: [
        'Crop Sales', 'Government Subsidies', 'Equipment Sales', 'Other Income'
      ]
    };
  }
}

module.exports = FinancialTransaction;