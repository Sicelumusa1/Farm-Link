const { oracledb } = require('../config/db');

class Order {
  static async create(orderData, existingConnection = null) {
    const {
      admin_id,
      crop_id,
      user_id,
      quantity,
      original_quantity,
      original_unit,
      original_unit_display,
      status = 'pending',
    } = orderData;

    let connection = existingConnection;
    let localTransaction = false;

    try {
      if (!connection) {
        connection = await oracledb.getConnection('default');
        localTransaction = true;
      }

      // Check crop availability
      const cropCheck = await connection.execute(
        `SELECT PRODUCE_YIELD FROM CROPS WHERE ID = :crop_id`,
        [crop_id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const crop = cropCheck.rows[0];
      if (!crop) throw new Error(`Crop with ID ${crop_id} not found`);

      const availableQty = crop.PRODUCE_YIELD || 0;
      if (availableQty < quantity) {
        throw new Error(`Insufficient stock: Available ${availableQty}kg, requested ${quantity}kg`);
      }

      // Insert order
      const insertOrder = await connection.execute(
        `
        INSERT INTO ORDERS (
          ADMIN_ID, CROP_ID, USER_ID, QUANTITY, ORIGINAL_QUANTITY,
          ORIGINAL_UNIT, ORIGINAL_UNIT_DISPLAY, STATUS, CREATED_AT
        )
        VALUES (
          :admin_id, :crop_id, :user_id, :quantity, :original_quantity,
          :original_unit, :original_unit_display, :status, CURRENT_TIMESTAMP
        )
        RETURNING ID INTO :order_id
      `,
        {
          admin_id,
          crop_id,
          user_id,
          quantity,
          original_quantity,
          original_unit,
          original_unit_display,
          status,
          order_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false }
      );

      const orderId = insertOrder.outBinds.order_id[0];

      // Deduct stock
      await connection.execute(
        `UPDATE CROPS SET PRODUCE_YIELD = PRODUCE_YIELD - :quantity WHERE ID = :crop_id`,
        [quantity, crop_id],
        { autoCommit: false }
      );

      if (localTransaction) await connection.commit();

      return {
        id: orderId,
        admin_id,
        crop_id,
        user_id,
        quantity,
        original_quantity,
        original_unit,
        original_unit_display,
        status,
      };
    } catch (err) {
      if (localTransaction && connection) await connection.rollback();
      throw err;
    } finally {
      if (localTransaction && connection) await connection.close().catch(console.error);
    }
  }

  static async findById(orderId) {
    let connection;
    try {
      connection = await oracledb.getConnection('default');
      const result = await connection.execute(
        `SELECT * FROM ORDERS WHERE ID = :id`,
        [orderId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Find order by ID with full details
  static async findByIdWithDetails(orderId) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const query = `
        SELECT 
          o.ID as "_id",
          o.QUANTITY as "quantity",
          o.STATUS as "status",
          o.CREATED_AT as "createdAt",
          o.ADMIN_ID as "adminId",
          o.USER_ID as "userId",
          c.ID as "cropId",
          c.CROP_NAME as "cropName",
          c.PRODUCE_YIELD as "availableQuantity",
          u_user.NAME as "userName",
          u_user.EMAIL as "userEmail",
          u_user.PHONE as "userPhone",
          u_admin.NAME as "adminName",
          f.NAME as "farmName",
          f.MUNICIPALITY as "farmMunicipality",
          f.CITY as "farmCity"
        FROM ORDERS o
        LEFT JOIN CROPS c ON o.CROP_ID = c.ID
        LEFT JOIN USERS u_user ON o.USER_ID = u_user.ID
        LEFT JOIN USERS u_admin ON o.ADMIN_ID = u_admin.ID
        LEFT JOIN FARMS f ON u_user.ID = f.USER_ID
        WHERE o.ID = :orderId
      `;
    const result = await connection.execute(query, [orderId]);
    return result.rows[0];
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}


  static async getAllOrdersWithDetails() {
  let connection;
  try {
    connection = await oracledb.getConnection("default");
    const query = `
      SELECT 
        o.ID AS "_id",
        o.QUANTITY AS "quantity",
        o.STATUS AS "status",
        o.CREATED_AT AS "createdAt",

        -- Crop Details
        c.ID AS "cropId",
        c.CROP_NAME AS "cropName",
        c.PRODUCE_YIELD AS "availableQuantity",

        -- Farmer Details
        u_user.ID AS "farmerId",
        u_user.NAME AS "farmerName",
        u_user.EMAIL AS "farmerEmail",
        u_user.PHONE AS "farmerPhone",

        -- Admin Details
        u_admin.NAME AS "adminName",

        -- Farm Details
        f.ID AS "farmId",
        f.NAME AS "farmName",
        f.MUNICIPALITY AS "farmMunicipality",
        f.CITY AS "farmCity"
      FROM ORDERS o
      LEFT JOIN CROPS c ON o.CROP_ID = c.ID
      LEFT JOIN USERS u_user ON o.USER_ID = u_user.ID
      LEFT JOIN USERS u_admin ON o.ADMIN_ID = u_admin.ID
      LEFT JOIN FARMS f ON u_user.ID = f.USER_ID
      ORDER BY o.CREATED_AT DESC
    `;

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    // Return consistent format that matches frontend expectations
    return result.rows.map(row => ({
      _id: row._id,
      id: row._id,
      quantity: row.quantity,
      status: row.status,
      dateIssued: row.createdAt,
      createdAt: row.createdAt,
      farmerDetails: {
        id: row.farmerId,
        name: row.farmerName || 'Unknown',
        email: row.farmerEmail || 'N/A',
        phone: row.farmerPhone || 'N/A'
      },
      farmDetails: {
        id: row.farmId,
        name: row.farmName || 'N/A',
        municipality: row.farmMunicipality || 'N/A',
        city: row.farmCity || 'N/A'
      },
      cropDetails: {
        id: row.cropId,
        cropName: row.cropName || 'N/A',
        availableQuantity: row.availableQuantity || 0
      },
      adminDetails: {
        name: row.adminName || 'Unknown'
      }
    }));
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

  // Get orders by user
  static async findByUserIdWithDetails(userId, status = null) {
  let connection;
  try {
    connection = await oracledb.getConnection("default");
    let query = `
      SELECT 
        o.ID as "_id",
        o.QUANTITY as "quantity",
        o.STATUS as "status",
        o.CREATED_AT as "createdAt",
        o.ADMIN_ID as "adminId",
        c.ID as "cropId",
        c.CROP_NAME as "cropName",
        c.PRODUCE_YIELD as "availableQuantity",
        u_admin.NAME as "adminName",
        u_admin.EMAIL as "adminEmail",
        u_admin.PHONE as "adminPhone"
      FROM ORDERS o
      LEFT JOIN CROPS c ON o.CROP_ID = c.ID
      LEFT JOIN USERS u_admin ON o.ADMIN_ID = u_admin.ID
      WHERE o.USER_ID = :userId
    `;

    const params = [userId];
    if (status) {
      query += ' AND o.STATUS = :status';
      params.push(status);
    }

    query += ' ORDER BY o.CREATED_AT DESC';

    const result = await connection.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    // Format response to match frontend expectations
    return result.rows.map(row => ({
      _id: row._id,
      quantity: row.quantity,
      status: row.status,
      createdAt: row.createdAt,
      cropDetails: {
        id: row.cropId,
        cropName: row.cropName || 'N/A',
        availableQuantity: row.availableQuantity || 0
      },
      adminDetails: {
        id: row.adminId,
        name: row.adminName || 'Unknown',
        email: row.adminEmail || 'N/A',
        phone: row.adminPhone || 'N/A'
      }
    }));
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

  // Update order status with inventory management
  static async updateStatus(orderId, newStatus) {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const orderQuery = `
        SELECT CROP_ID, QUANTITY, STATUS 
        FROM ORDERS 
        WHERE ID = :orderId
      `;
    const orderResult = await connection.execute(orderQuery, [orderId]);
    const order = orderResult.rows[0];
    if (!order) throw new Error('Order not found');

    const { CROP_ID, QUANTITY, STATUS: oldStatus } = order;

    // Inventory adjustments
    if (oldStatus !== newStatus) {
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        await connection.execute(
          `UPDATE CROPS SET PRODUCE_YIELD = PRODUCE_YIELD + :quantity WHERE ID = :crop_id`,
          [QUANTITY, CROP_ID],
          { autoCommit: false }
        );
      } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
        await connection.execute(
          `UPDATE CROPS SET PRODUCE_YIELD = PRODUCE_YIELD - :quantity WHERE ID = :crop_id`,
          [QUANTITY, CROP_ID],
          { autoCommit: false }
        );
      }
    }

    await connection.execute(
      `UPDATE ORDERS SET STATUS = :status WHERE ID = :id`,
      [newStatus, orderId],
      { autoCommit: false }
    );

    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

  // Update order quantity (admin side only)
  static async update(orderId, newQuantity) {
  let connection;
  try {
    connection = await oracledb.getConnection("default");

    // Check if order exists and is still editable
    const orderCheckQuery = `
      SELECT STATUS, QUANTITY, CROP_ID
      FROM ORDERS
      WHERE ID = :orderId
    `;
    const orderResult = await connection.execute(orderCheckQuery, [orderId], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    const { STATUS: currentStatus, QUANTITY: oldQuantity, CROP_ID } = orderResult.rows[0];

    // Prevent updates once acknowledged/dispatched/delivered
    if (['acknowledged', 'dispatched', 'delivered', 'received'].includes(currentStatus)) {
      throw new Error(`Cannot edit order once it is ${currentStatus}.`);
    }

    // Adjust crop inventory based on quantity change
    const difference = newQuantity - oldQuantity;
    if (difference !== 0) {
      // If increasing order quantity → subtract from inventory
      if (difference > 0) {
        const checkStock = `
          SELECT PRODUCE_YIELD FROM CROPS WHERE ID = :cropId
        `;
        const cropResult = await connection.execute(checkStock, [CROP_ID], {
          outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        const available = cropResult.rows[0]?.PRODUCE_YIELD || 0;
        if (available < difference) {
          throw new Error(`Not enough stock. Available: ${available}kg`);
        }

        await connection.execute(
          `UPDATE CROPS SET PRODUCE_YIELD = PRODUCE_YIELD - :diff WHERE ID = :cropId`,
          [difference, CROP_ID],
          { autoCommit: false }
        );
      }
      // If decreasing → return quantity to inventory
      else {
        await connection.execute(
          `UPDATE CROPS SET PRODUCE_YIELD = PRODUCE_YIELD + :diff WHERE ID = :cropId`,
          [Math.abs(difference), CROP_ID],
          { autoCommit: false }
        );
      }
    }

    // Update order quantity
    await connection.execute(
      `UPDATE ORDERS SET QUANTITY = :quantity, UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = :orderId`,
      [newQuantity, orderId],
      { autoCommit: false }
    );

    await connection.commit();
    return true;

  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}


  // Delete order and restore inventory
  static async delete (orderId) {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const orderResult = await connection.execute(
      `SELECT CROP_ID, QUANTITY, STATUS FROM ORDERS WHERE ID = :orderId`,
      [orderId]
    );
    const order = orderResult.rows[0];
    if (!order) throw new Error('Order not found');

    if (order.STATUS !== 'cancelled') {
      await connection.execute(
        `UPDATE CROPS SET PRODUCE_YIELD = PRODUCE_YIELD + :quantity WHERE ID = :crop_id`,
        [order.QUANTITY, order.CROP_ID],
        { autoCommit: false }
      );
    }

    await connection.execute(`DELETE FROM ORDERS WHERE ID = :orderId`, [orderId], { autoCommit: false });
    await connection.commit();
    return true;

  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}
}

module.exports = Order;