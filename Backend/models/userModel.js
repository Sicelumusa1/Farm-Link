const { oracledb } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = {
  async create({ name, email, password, phone, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    let connection;

    try {
      connection = await oracledb.getConnection("default");

      const result = await connection.execute(
        `INSERT INTO users (name, email, password, phone, role, created_at)
         VALUES (:name, :email, :password, :phone, :role, CURRENT_TIMESTAMP)
         RETURNING id INTO :id`,
        {
          name,
          email,
          password: hashedPassword,
          phone,
          role: role || 'user',
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );

      await connection.commit();
      return result.outBinds.id[0];
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  },

  async findByEmail(email) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      const result = await connection.execute(
        `SELECT id, name, email, password, phone, role, created_at 
         FROM users WHERE email = :email`,
        { email },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows[0]) {
        return {
          id: result.rows[0].ID,
          name: result.rows[0].NAME,
          email: result.rows[0].EMAIL,
          password: result.rows[0].PASSWORD,
          phone: result.rows[0].PHONE,
          role: result.rows[0].ROLE,
          createdAt: result.rows[0].CREATED_AT,
          hasProvidedFarmDetails: result.rows[0].HAS_PROVIDED_FARM_DETAILS,
          getJwtToken: function () {
          return jwt.sign({ id: this.id }, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRY_TIME || '7d' 
          });
        }
        };
      }
      return null;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  },

  async findById(id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      const result = await connection.execute(
        `SELECT id, name, email, phone, role, created_at 
         FROM users WHERE id = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows[0]) {
        return {
          id: result.rows[0].ID,
          name: result.rows[0].NAME,
          email: result.rows[0].EMAIL,
          phone: result.rows[0].PHONE,
          role: result.rows[0].ROLE,
          createdAt: result.rows[0].CREATED_AT,
          hasProvidedFarmDetails: result.rows[0].HAS_PROVIDED_FARM_DETAILS === 1
        };
      }
      return null;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  },

  async findByIdWithPassword(id) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      const result = await connection.execute(
        `SELECT id, name, email, password, phone, role, created_at, has_provided_farm_details
       FROM users WHERE id = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows[0]) {
        return {
          id: result.rows[0].ID,
          name: result.rows[0].NAME,
          email: result.rows[0].EMAIL,
          password: result.rows[0].PASSWORD,
          phone: result.rows[0].PHONE,
          role: result.rows[0].ROLE,
          createdAt: result.rows[0].CREATED_AT,
          hasProvidedFarmDetails: result.rows[0].HAS_PROVIDED_FARM_DETAILS
        };
      }
      return null;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  },

  async comparePassword(enteredPassword, storedHash) {
    return bcrypt.compare(enteredPassword, storedHash);
  },

  generateJwtToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY_TIME || '7d'
    });
  },

  async setResetPasswordToken(userId) {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpire = new Date(Date.now() + 30 * 60 * 1000);

    let connection;
    try {
      connection = await oracledb.getConnection("default");
      await connection.execute(
        `UPDATE users SET reset_password_token = :token, reset_password_expire = :expire WHERE id = :id`,
        {
          token: resetTokenHash,
          expire: resetExpire,
          id: userId
        }
      );
      await connection.commit();
      return resetToken;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  },

  async updateHasProvidedFarmDetails(userId, hasProvided) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      await connection.execute(
        `UPDATE users SET has_provided_farm_details = :hasProvided WHERE id = :id`,
        { hasProvided: hasProvided ? 1 : 0, id: userId }
      );
      await connection.commit();
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  },

  async updateLastVisited(userId, date) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      await connection.execute(
        `UPDATE users SET last_visited = :last_visited WHERE id = :id`,
        { last_visited: date, id: userId }
      );
      await connection.commit();
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  },

  async deleteUser(userId) {
    let connection;
    try {
      connection = await oracledb.getConnection("default");
      const result = await connection.execute(
        `DELETE FROM users WHERE id = :id`,
        { id: userId }
      );
      await connection.commit();
      return result.rowsAffected > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.close().catch(err => console.error(err));
    }
  }
};

module.exports = User;