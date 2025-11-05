-- Farm Link Database Schema for Oracle Autonomous Database
-- This script creates all necessary tables with proper constraints and sequences

-- Enable output for SQL*Plus compatibility
SET SERVEROUTPUT ON;
SET FEEDBACK ON;
SET LINESIZE 200;
SET PAGESIZE 1000;

-- Drop tables in correct order (if they exist) to handle foreign key constraints
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE deliveries CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE orders CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE crop_images CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE crops CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE farms CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Create Users table
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(150) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    phone VARCHAR2(20) NOT NULL,
    role VARCHAR2(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_password_token VARCHAR2(255),
    reset_password_expire TIMESTAMP,
    has_provided_farm_details NUMBER(1) DEFAULT 0 CHECK (has_provided_farm_details IN (0, 1)),
    last_visited TIMESTAMP
);

COMMENT ON TABLE users IS 'Stores user information for farmers and administrators';
COMMENT ON COLUMN users.role IS 'User role: user (farmer) or admin';
COMMENT ON COLUMN users.has_provided_farm_details IS 'Boolean flag: 0=false, 1=true';

-- Create Farms table
CREATE TABLE farms (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    municipality VARCHAR2(150) NOT NULL,
    ward VARCHAR2(50) NOT NULL,
    latitude NUMBER(10,8),
    longitude NUMBER(11,8),
    city VARCHAR2(100) NOT NULL,
    farm_size NUMBER(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE farms IS 'Stores farm information for each user';
COMMENT ON COLUMN farms.latitude IS 'Geographic latitude for route planning';
COMMENT ON COLUMN farms.longitude IS 'Geographic longitude for route planning';

-- Create Crops table
CREATE TABLE crops (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farm_id NUMBER NOT NULL,
    crop_name VARCHAR2(100) NOT NULL,
    plant_date DATE NOT NULL,
    type VARCHAR2(20) NOT NULL CHECK (type IN ('direct sow', 'transplant')),
    units_planted NUMBER NOT NULL,
    growth_stage VARCHAR2(50) DEFAULT 'Planting',
    produce_yield NUMBER(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

COMMENT ON TABLE crops IS 'Stores crop information for each farm';
COMMENT ON COLUMN crops.type IS 'Planting type: direct sow or transplant';
COMMENT ON COLUMN crops.growth_stage IS 'Current growth stage of the crop';
COMMENT ON COLUMN crops.produce_yield IS 'Total yield produced in kilograms';

-- Create Crop Images table (for growth tracking)
CREATE TABLE crop_images (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    crop_id NUMBER NOT NULL,
    url VARCHAR2(500) NOT NULL,
    growth_stage VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

COMMENT ON TABLE crop_images IS 'Stores images for crop growth tracking';
COMMENT ON COLUMN crop_images.growth_stage IS 'Growth stage when image was taken';

-- Create Orders table
CREATE TABLE orders (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id NUMBER NOT NULL,
    crop_id NUMBER NOT NULL,
    quantity NUMBER NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'received')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

COMMENT ON TABLE orders IS 'Stores order information from admins to farmers';
COMMENT ON COLUMN orders.status IS 'Order status: pending, dispatched, received';

-- Create Deliveries table
CREATE TABLE deliveries (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    crop_id NUMBER NOT NULL,
    address VARCHAR2(255) NOT NULL,
    delivery_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

COMMENT ON TABLE deliveries IS 'Stores delivery information for orders';

CREATE TABLE farm_transactions (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farm_id NUMBER NOT NULL REFERENCES farms(id),
    type VARCHAR2(10) CHECK (type IN ('income', 'expense')),
    crop_id NUMBER REFERENCES crops(id),
    category VARCHAR2(50) NOT NULL,
    amount NUMBER(10,2) NOT NULL,
    description VARCHAR2(500),
    transaction_date DATE NOT NULL,
    created_by NUMBER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_farms_municipality ON farms(municipality);
CREATE INDEX idx_farms_location ON farms(latitude, longitude);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_crops_crop_name ON crops(crop_name);
CREATE INDEX idx_crops_plant_date ON crops(plant_date);
CREATE INDEX idx_crop_images_crop_id ON crop_images(crop_id);
CREATE INDEX idx_orders_admin_id ON orders(admin_id);
CREATE INDEX idx_orders_crop_id ON orders(crop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX idx_deliveries_crop_id ON deliveries(crop_id);
CREATE INDEX idx_deliveries_date ON deliveries(date);
CREATE INDEX idx_farm_transactions_farm_date ON farm_transactions(farm_id, transaction_date);
CREATE INDEX idx_farm_transactions_crop ON farm_transactions(crop_id);
CREATE INDEX idx_farm_transactions_type ON farm_transactions(type);
CREATE INDEX idx_farm_transactions_category ON farm_transactions(category);

-- Create sequences for ID generation (backup for IDENTITY columns)
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE farms_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE crops_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE crop_images_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE orders_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE deliveries_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;


COMMIT;

-- Display table creation summary
BEGIN
    DBMS_OUTPUT.PUT_LINE('=========================================');
    DBMS_OUTPUT.PUT_LINE('FARM LINK DATABASE SCHEMA CREATED SUCCESSFULLY');
    DBMS_OUTPUT.PUT_LINE('=========================================');
    DBMS_OUTPUT.PUT_LINE('Tables created:');
    DBMS_OUTPUT.PUT_LINE('1. users - User accounts and profiles');
    DBMS_OUTPUT.PUT_LINE('2. farms - Farm information and locations');
    DBMS_OUTPUT.PUT_LINE('3. crops - Crop planting and yield data');
    DBMS_OUTPUT.PUT_LINE('4. crop_images - Crop growth tracking images');
    DBMS_OUTPUT.PUT_LINE('5. orders - Order management system');
    DBMS_OUTPUT.PUT_LINE('6. deliveries - Delivery tracking');
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('Sample data inserted:');
    DBMS_OUTPUT.PUT_LINE('- Admin user: admin@farmlink.com');
    DBMS_OUTPUT.PUT_LINE('- Farmer user: farmer@example.com');
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('Indexes created for optimal performance');
    DBMS_OUTPUT.PUT_LINE('=========================================');
END;
/

-- Verify table creation
SELECT table_name, num_rows 
FROM user_tables 
WHERE table_name IN ('USERS', 'FARMS', 'CROPS', 'CROP_IMAGES', 'ORDERS', 'DELIVERIES')
ORDER BY table_name;

-- Display sample data
SELECT 'Users count: ' || COUNT(*) as info FROM users
UNION ALL
SELECT 'Admin users: ' || COUNT(*) as info FROM users WHERE role = 'admin'
UNION ALL
SELECT 'Farmer users: ' || COUNT(*) as info FROM users WHERE role = 'user';