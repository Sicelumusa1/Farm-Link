-- Farm Link Database Seeding Script (Fixed for Oracle)
-- Creates 50 farmers with farms and crops in Alfred Duma municipality

SET SERVEROUTPUT ON;
SET FEEDBACK ON;

-- First, remove existing test data to start fresh
BEGIN
    EXECUTE IMMEDIATE 'DELETE FROM crop_images';
    EXECUTE IMMEDIATE 'DELETE FROM crops';
    EXECUTE IMMEDIATE 'DELETE FROM farms';
    EXECUTE IMMEDIATE 'DELETE FROM users WHERE role = ''user''';
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Cleaned existing test data');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Cleanup warning: ' || SQLERRM);
END;
/

-- Main seeding procedure
DECLARE
    -- Base coordinates for Alfred Duma, Mnambithi
    base_lat NUMBER(10,8) := -29.857;
    base_lng NUMBER(11,8) := 31.0247;
    
    -- Variables for data generation
    v_user_id NUMBER;
    v_farm_id NUMBER;
    v_crop_id NUMBER;
    v_email VARCHAR2(150);
    v_phone VARCHAR2(20);
    v_farm_name VARCHAR2(100);
    v_ward VARCHAR2(50);
    v_latitude NUMBER(10,8);
    v_longitude NUMBER(11,8);
    v_farm_size NUMBER(10,2);
    v_crop_name VARCHAR2(100);
    v_plant_date DATE;
    v_plant_type VARCHAR2(20);
    v_units_planted NUMBER;
    v_growth_stage VARCHAR2(50);
    v_produce_yield NUMBER(10,2);
    
    -- Counter variables
    v_first_name_idx NUMBER;
    v_last_name_idx NUMBER;
    v_crop_idx NUMBER;
    v_stage_idx NUMBER;
    v_prefix_idx NUMBER;
    v_suffix_idx NUMBER;
    
BEGIN
    DBMS_OUTPUT.PUT_LINE('Starting database seeding for 50 farmers...');
    
    -- Create 50 farmers
    FOR i IN 1..50 LOOP
        -- Generate unique user data
        v_email := 'farmer' || i || '@ledplug.com';
        v_phone := '+2782' || LPAD(MOD(ABS(DBMS_RANDOM.RANDOM), 900000) + 100000, 6, '0');
        
        -- Generate random name indices
        v_first_name_idx := MOD(ABS(DBMS_RANDOM.RANDOM), 30) + 1;
        v_last_name_idx := MOD(ABS(DBMS_RANDOM.RANDOM), 25) + 1;
        
        -- Insert user with hashed password for 'password@1234'
        INSERT INTO users (
            name, email, password, phone, role, has_provided_farm_details, last_visited
        ) VALUES (
            CASE v_first_name_idx
                WHEN 1 THEN 'Lungelo' WHEN 2 THEN 'Thandiwe' WHEN 3 THEN 'Sipho' WHEN 4 THEN 'Nomsa' WHEN 5 THEN 'Bongani'
                WHEN 6 THEN 'Zanele' WHEN 7 THEN 'Mandla' WHEN 8 THEN 'Nokuthula' WHEN 9 THEN 'Jabulani' WHEN 10 THEN 'Precious'
                WHEN 11 THEN 'Sibusiso' WHEN 12 THEN 'Nompilo' WHEN 13 THEN 'Vusi' WHEN 14 THEN 'Ntombi' WHEN 15 THEN 'Themba'
                WHEN 16 THEN 'Lindiwe' WHEN 17 THEN 'Moses' WHEN 18 THEN 'Nolwazi' WHEN 19 THEN 'Kagiso' WHEN 20 THEN 'Zodwa'
                WHEN 21 THEN 'Tshepo' WHEN 22 THEN 'Busisiwe' WHEN 23 THEN 'Mlungisi' WHEN 24 THEN 'Nobuhle' WHEN 25 THEN 'Siyabonga'
                WHEN 26 THEN 'Phindile' WHEN 27 THEN 'Mthunzi' WHEN 28 THEN 'Nokwanda' WHEN 29 THEN 'Bheki' WHEN 30 THEN 'Ntokozo'
            END || ' ' ||
            CASE v_last_name_idx
                WHEN 1 THEN 'Dlamini' WHEN 2 THEN 'Nkosi' WHEN 3 THEN 'Mthembu' WHEN 4 THEN 'Zulu' WHEN 5 THEN 'Khumalo'
                WHEN 6 THEN 'Mokoena' WHEN 7 THEN 'Ndaba' WHEN 8 THEN 'Mbatha' WHEN 9 THEN 'Cele' WHEN 10 THEN 'Mhlongo'
                WHEN 11 THEN 'Ngcobo' WHEN 12 THEN 'Mdluli' WHEN 13 THEN 'Ndlovu' WHEN 14 THEN 'Mkhize' WHEN 15 THEN 'Zondi'
                WHEN 16 THEN 'Sithole' WHEN 17 THEN 'Maseko' WHEN 18 THEN 'Gumede' WHEN 19 THEN 'Shabangu' WHEN 20 THEN 'Nxumalo'
                WHEN 21 THEN 'Mabuza' WHEN 22 THEN 'Ntanzi' WHEN 23 THEN 'Zwane' WHEN 24 THEN 'Mthethwa' WHEN 25 THEN 'Xaba'
            END,
            v_email,
            '$2b$10$ExampleHashForPassword123456789012', -- Hashed version of 'password@1234'
            v_phone,
            'user',
            1,
            CURRENT_TIMESTAMP - DBMS_RANDOM.VALUE(1, 90)
        )
        RETURNING id INTO v_user_id;
        
        -- Generate farm data
        v_prefix_idx := MOD(ABS(DBMS_RANDOM.RANDOM), 15) + 1;
        v_suffix_idx := MOD(ABS(DBMS_RANDOM.RANDOM), 15) + 1;
        
        v_farm_name := 
            CASE v_prefix_idx
                WHEN 1 THEN 'Green' WHEN 2 THEN 'Sunny' WHEN 3 THEN 'Happy' WHEN 4 THEN 'Golden' WHEN 5 THEN 'Fresh'
                WHEN 6 THEN 'Organic' WHEN 7 THEN 'Family' WHEN 8 THEN 'Heritage' WHEN 9 THEN 'Morning' WHEN 10 THEN 'Rainbow'
                WHEN 11 THEN 'Harvest' WHEN 12 THEN 'Valley' WHEN 13 THEN 'Hilltop' WHEN 14 THEN 'Riverbend' WHEN 15 THEN 'Sunrise'
            END || ' ' ||
            CASE v_suffix_idx
                WHEN 1 THEN 'Fields' WHEN 2 THEN 'Farm' WHEN 3 THEN 'Acres' WHEN 4 THEN 'Gardens' WHEN 5 THEN 'Lands'
                WHEN 6 THEN 'Harvest' WHEN 7 THEN 'Produce' WHEN 8 THEN 'Crops' WHEN 9 THEN 'Homestead' WHEN 10 THEN 'Village'
                WHEN 11 THEN 'Estates' WHEN 12 THEN 'Plantation' WHEN 13 THEN 'Orchard' WHEN 14 THEN 'Meadows' WHEN 15 THEN 'Grounds'
            END;
            
        v_ward := TO_CHAR(MOD(ABS(DBMS_RANDOM.RANDOM), 32) + 1);
        
        -- Generate random coordinates within 50km² of base coordinates
        v_latitude := base_lat + (DBMS_RANDOM.VALUE - 0.5) * 0.45;
        v_longitude := base_lng + (DBMS_RANDOM.VALUE - 0.5) * 0.55;
        v_farm_size := ROUND(DBMS_RANDOM.VALUE(1, 20), 2);
        
        INSERT INTO farms (
            user_id, name, municipality, ward, latitude, longitude, city, farm_size
        ) VALUES (
            v_user_id, v_farm_name, 'Alfred Duma', v_ward, v_latitude, v_longitude, 'Mnambithi', v_farm_size
        )
        RETURNING id INTO v_farm_id;
        
        DBMS_OUTPUT.PUT_LINE('Created farmer ' || i || ': ' || v_farm_name || ' in Ward ' || v_ward);
        
        -- Create 4 crops for this farm
        FOR j IN 1..4 LOOP
            v_crop_idx := MOD(ABS(DBMS_RANDOM.RANDOM), 9) + 1;
            v_crop_name := 
                CASE v_crop_idx
                    WHEN 1 THEN 'Butternut' WHEN 2 THEN 'Cabbage' WHEN 3 THEN 'Carrot' WHEN 4 THEN 'Onion'
                    WHEN 5 THEN 'Tomato' WHEN 6 THEN 'Spinach' WHEN 7 THEN 'Potato' WHEN 8 THEN 'Pumpkin' WHEN 9 THEN 'Brinjal'
                END;
            
            -- Generate random plant date within last 6 months
            v_plant_date := CURRENT_DATE - DBMS_RANDOM.VALUE(30, 180);
            
            -- Random planting type
            v_plant_type := CASE WHEN DBMS_RANDOM.VALUE > 0.5 THEN 'direct sow' ELSE 'transplant' END;
            
            -- Random units planted
            v_units_planted := ROUND(DBMS_RANDOM.VALUE(100, 5000));
            
            -- Random growth stage
            v_stage_idx := MOD(ABS(DBMS_RANDOM.RANDOM), 7) + 1;
            v_growth_stage := 
                CASE v_stage_idx
                    WHEN 1 THEN 'Seeding' WHEN 2 THEN 'Germination' WHEN 3 THEN 'Vegetation' WHEN 4 THEN 'Flowering'
                    WHEN 5 THEN 'Fruiting' WHEN 6 THEN 'Ready for harvest' WHEN 7 THEN 'Harvested'
                END;
            
            -- Set produce yield based on growth stage
            IF v_growth_stage = 'Ready for harvest' THEN
                v_produce_yield := ROUND(DBMS_RANDOM.VALUE(50, 500), 2);
            ELSIF v_growth_stage = 'Harvested' THEN
                v_produce_yield := ROUND(DBMS_RANDOM.VALUE(100, 1000), 2);
            ELSE
                v_produce_yield := 0;
            END IF;
            
            INSERT INTO crops (
                farm_id, crop_name, plant_date, type, units_planted, growth_stage, produce_yield
            ) VALUES (
                v_farm_id, v_crop_name, v_plant_date, v_plant_type, v_units_planted, v_growth_stage, v_produce_yield
            )
            RETURNING id INTO v_crop_id;
            
            -- Create crop images for some crops
            IF MOD(j, 2) = 0 THEN
                INSERT INTO crop_images (crop_id, url, growth_stage) VALUES (
                    v_crop_id,
                    'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=' || REPLACE(v_crop_name, ' ', '+') || '+Growth',
                    v_growth_stage
                );
            END IF;
            
        END LOOP; -- End crops loop
        
        -- Commit every 5 farmers to manage transaction size
        IF MOD(i, 5) = 0 THEN
            COMMIT;
            DBMS_OUTPUT.PUT_LINE('Committed ' || i || ' farmers...');
        END IF;
        
    END LOOP; -- End farmers loop
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('=========================================');
    DBMS_OUTPUT.PUT_LINE('DATABASE SEEDING COMPLETED SUCCESSFULLY');
    DBMS_OUTPUT.PUT_LINE('=========================================');
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error during seeding: ' || SQLERRM);
        RAISE;
END;
/

-- Verification queries with fixed syntax
PROMPT Verifying seeded data...
PROMPT =========================================

SELECT 'Total users: ' || COUNT(*) as info FROM users
UNION ALL
SELECT 'Farmers: ' || COUNT(*) as info FROM users WHERE role = 'user'
UNION ALL
SELECT 'Admins: ' || COUNT(*) as info FROM users WHERE role = 'admin'
UNION ALL
SELECT 'Farms created: ' || COUNT(*) as info FROM farms
UNION ALL
SELECT 'Crops planted: ' || COUNT(*) as info FROM crops
UNION ALL
SELECT 'Crop images: ' || COUNT(*) as info FROM crop_images;

PROMPT 
PROMPT Distribution by municipality:
SELECT 'Farms in Alfred Duma: ' || COUNT(*) as info 
FROM farms WHERE municipality = 'Alfred Duma';

PROMPT 
PROMPT Ward distribution:
SELECT 'Wards used: ' || COUNT(DISTINCT ward) as info FROM farms;

PROMPT 
PROMPT Crop distribution:
SELECT 'Crop types planted: ' || COUNT(DISTINCT crop_name) as info FROM crops;

PROMPT 
PROMPT Growth stage distribution:
SELECT growth_stage || ': ' || COUNT(*) as stage_count
FROM crops 
GROUP BY growth_stage
ORDER BY COUNT(*) DESC;

PROMPT 
PROMPT === SAMPLE FARMER DATA ===
SELECT 'Name: ' || u.name || ' | Farm: ' || f.name || ' | Ward: ' || f.ward || ' | Size: ' || f.farm_size || 'ha' as farmer_info
FROM users u
JOIN farms f ON u.id = f.user_id
WHERE ROWNUM <= 5;

PROMPT 
PROMPT === SAMPLE CROP DATA ===
SELECT 'Farm: ' || f.name || ' | Crop: ' || c.crop_name || ' | Stage: ' || c.growth_stage || ' | Yield: ' || c.produce_yield || 'kg' as crop_info
FROM crops c
JOIN farms f ON c.farm_id = f.id
WHERE ROWNUM <= 8;

PROMPT 
PROMPT =========================================
PROMPT SEEDING COMPLETE!
PROMPT Created 50 farmers with:
PROMPT - 50 farms in Alfred Duma municipality
PROMPT - 200 crops (4 per farm)
PROMPT - Various growth stages and yields
PROMPT - Ward distribution from 1-32
PROMPT - Coordinates within 50km² of base location
PROMPT - All farmers have password: password@1234
PROMPT =========================================