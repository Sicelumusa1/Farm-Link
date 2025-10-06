const turf = require('@turf/turf');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const nearestNeighborTSP = require('../utils/tsp');
const Farm = require('../models/farmModel');

// Calculate distance between two sets of coordinates using the Haversine formula
function getDistance(locationA, locationB) {
  try {
    return turf.distance(
      turf.point([locationA.longitude, locationA.latitude]),
      turf.point([locationB.longitude, locationB.latitude]),
      { units: 'kilometers' }
    );
  } catch (error) {
    console.error('Error calculating distance:', error);
    // Return a large distance as fallback
    return 9999;
  }
}

// Calculate a distance matrix for a given array of farms
function calculateDistanceMatrix(farms) {
  // Start with empty array to store calculated distances 
  const distances = [];

  for (let i = 0; i < farms.length; i++) {
    // Create an empty array within 'distances' for each farm
    distances[i] = []; 

    for (let j = 0; j < farms.length; j++) {
      if (i === j) {
        // Set distance between the same farm to 0
        distances[i][j] = 0; 
      } else {
        // Validate coordinates
        if (!farms[i].LONGITUDE || !farms[i].LATITUDE || 
            !farms[j].LONGITUDE || !farms[j].LATITUDE) {
          // Use a default large distance if coordinates are missing
          distances[i][j] = 9999;
        } else {
          // Calculate the distance between the coordinates of farms 'i' and 'j'
          const coordsA = {
            longitude: parseFloat(farms[i].LONGITUDE),
            latitude: parseFloat(farms[i].LATITUDE)
          };
          const coordsB = {
            longitude: parseFloat(farms[j].LONGITUDE),
            latitude: parseFloat(farms[j].LATITUDE)
          };
          
          distances[i][j] = getDistance(coordsA, coordsB);
        }
      }
    }
  }
  // Return the resulting 'distances' matrix. 
  return distances;
}

// Get route plan for multiple farms
const getPlan = catchAsyncErrors(async (req, res, next) => {
  const { farmNames, startingFarmId } = req.body;

  // Validate input
  if (!farmNames || !Array.isArray(farmNames) || farmNames.length === 0) {
    return next(new ErrorHandler('Please provide an array of farm names', 400));
  }

  // Fetch farms based on the provided names
  let farms = [];
  
  // Get all farms with the specified names
  for (const farmName of farmNames) {
    const farmResults = await Farm.findByName(farmName);
    if (farmResults && farmResults.length > 0) {
      farms = farms.concat(farmResults);
    }
  }

  if (farms.length === 0) {
    return next(new ErrorHandler('No farms found for the provided names', 404));
  }

  // Remove duplicates based on farm ID
  const uniqueFarms = [];
  const farmIds = new Set();
  
  for (const farm of farms) {
    if (!farmIds.has(farm.ID)) {
      farmIds.add(farm.ID);
      uniqueFarms.push(farm);
    }
  }

  // If starting farm ID is provided, reorder farms to start with that farm
  let startingIndex = 0;
  if (startingFarmId) {
    startingIndex = uniqueFarms.findIndex(farm => farm.ID === parseInt(startingFarmId));
    if (startingIndex === -1) {
      return next(new ErrorHandler('Starting farm not found in the provided list', 404));
    }
    
    // Move starting farm to the beginning
    if (startingIndex > 0) {
      const startingFarm = uniqueFarms.splice(startingIndex, 1)[0];
      uniqueFarms.unshift(startingFarm);
    }
  }

  // Check if farms have coordinates
  const farmsWithCoords = uniqueFarms.filter(farm => farm.LATITUDE && farm.LONGITUDE);
  const farmsWithoutCoords = uniqueFarms.filter(farm => !farm.LATITUDE || !farm.LONGITUDE);

  if (farmsWithCoords.length === 0) {
    return next(new ErrorHandler('No farms with valid coordinates found', 404));
  }

  // Calculate distance matrix and route
  const distanceMatrix = calculateDistanceMatrix(farmsWithCoords);
  const routeIndices = nearestNeighborTSP(distanceMatrix);

  // Create the route with actual farm data
  const route = routeIndices.map(index => {
    if (index >= 0 && index < farmsWithCoords.length) {
      return {
        farm_id: farmsWithCoords[index].ID,
        farm_name: farmsWithCoords[index].NAME,
        sequence: routeIndices.indexOf(index),
        coordinates: {
          latitude: farmsWithCoords[index].LATITUDE,
          longitude: farmsWithCoords[index].LONGITUDE
        }
      };
    }
    return null;
  }).filter(Boolean);

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < routeIndices.length - 1; i++) {
    const fromIndex = routeIndices[i];
    const toIndex = routeIndices[i + 1];
    if (fromIndex >= 0 && toIndex >= 0 && 
        fromIndex < distanceMatrix.length && toIndex < distanceMatrix.length) {
      totalDistance += distanceMatrix[fromIndex][toIndex];
    }
  }

  // Calculate estimated time (assuming average speed of 40 km/h)
  const estimatedTimeHours = totalDistance / 40;
  const estimatedTimeMinutes = Math.round(estimatedTimeHours * 60);

  res.status(200).json({
    success: true,
    data: {
      route: route,
      summary: {
        total_farms: farmsWithCoords.length,
        farms_without_coordinates: farmsWithoutCoords.length,
        total_distance_km: Math.round(totalDistance * 100) / 100,
        estimated_time_minutes: estimatedTimeMinutes,
        starting_point: route[0]?.farm_name || 'Unknown'
      },
      farms_without_coordinates: farmsWithoutCoords.map(farm => ({
        farm_id: farm.ID,
        farm_name: farm.NAME,
        reason: 'Missing coordinates'
      })),
      distance_matrix: distanceMatrix
    }
  });
});

// Get optimized route for all farms of a specific user (admin feature)
const getUserFarmsRoute = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { startingFarmId } = req.body;

  // Check if user is admin
  const user = await require('../models/userModel').findById(userId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  // Get all farms with coordinates
  const farms = await Farm.getAllFarmsWithCoordinates();
  
  if (farms.length === 0) {
    return next(new ErrorHandler('No farms with coordinates found in the system', 404));
  }

  // If starting farm ID is provided, reorder farms
  let startingIndex = 0;
  if (startingFarmId) {
    startingIndex = farms.findIndex(farm => farm.ID === parseInt(startingFarmId));
    if (startingIndex === -1) {
      return next(new ErrorHandler('Starting farm not found', 404));
    }
    
    if (startingIndex > 0) {
      const startingFarm = farms.splice(startingIndex, 1)[0];
      farms.unshift(startingFarm);
    }
  }

  const farmsWithCoords = farms.filter(farm => farm.LATITUDE && farm.LONGITUDE);

  if (farmsWithCoords.length === 0) {
    return next(new ErrorHandler('No farms with valid coordinates found', 404));
  }

  // Calculate distance matrix and route
  const distanceMatrix = calculateDistanceMatrix(farmsWithCoords);
  const routeIndices = nearestNeighborTSP(distanceMatrix);

  // Create the route with actual farm data
  const route = routeIndices.map(index => {
    if (index >= 0 && index < farmsWithCoords.length) {
      return {
        farm_id: farmsWithCoords[index].ID,
        farm_name: farmsWithCoords[index].NAME,
        farmer_name: farmsWithCoords[index].FARMER_NAME,
        municipality: farmsWithCoords[index].MUNICIPALITY,
        ward: farmsWithCoords[index].WARD,
        sequence: routeIndices.indexOf(index),
        coordinates: {
          latitude: farmsWithCoords[index].LATITUDE,
          longitude: farmsWithCoords[index].LONGITUDE
        }
      };
    }
    return null;
  }).filter(Boolean);

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < routeIndices.length - 1; i++) {
    const fromIndex = routeIndices[i];
    const toIndex = routeIndices[i + 1];
    totalDistance += distanceMatrix[fromIndex][toIndex];
  }

  // Calculate estimated time (assuming average speed of 40 km/h)
  const estimatedTimeHours = totalDistance / 40;
  const estimatedTimeMinutes = Math.round(estimatedTimeHours * 60);

  res.status(200).json({
    success: true,
    data: {
      route: route,
      summary: {
        total_farms: farmsWithCoords.length,
        total_distance_km: Math.round(totalDistance * 100) / 100,
        estimated_time_minutes: estimatedTimeMinutes,
        average_speed_kmh: 40,
        starting_point: route[0]?.farm_name || 'Unknown'
      }
    }
  });
});

// Get route for farms with pending orders
const getFarmsWithPendingOrdersRoute = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user is admin
  const user = await require('../models/userModel').findById(userId);
  if (!user || user.ROLE !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  let connection;
  try {
    connection = await require('../config/db').oracledb.getConnection();
    
    // Get farms with pending orders
    const result = await connection.execute(
      `SELECT DISTINCT 
          f.id as farm_id,
          f.name as farm_name,
          f.latitude,
          f.longitude,
          f.municipality,
          f.ward,
          u.name as farmer_name,
          COUNT(o.id) as pending_orders_count
       FROM farms f
       JOIN crops c ON f.id = c.farm_id
       JOIN orders o ON c.id = o.crop_id
       JOIN users u ON f.user_id = u.id
       WHERE o.status = 'pending'
         AND f.latitude IS NOT NULL 
         AND f.longitude IS NOT NULL
       GROUP BY f.id, f.name, f.latitude, f.longitude, f.municipality, f.ward, u.name
       HAVING COUNT(o.id) > 0
       ORDER BY pending_orders_count DESC`,
      {},
      { outFormat: require('../config/db').oracledb.OUT_FORMAT_OBJECT }
    );

    const farms = result.rows;

    if (farms.length === 0) {
      return next(new ErrorHandler('No farms with pending orders found', 404));
    }

    // Calculate distance matrix and route
    const distanceMatrix = calculateDistanceMatrix(farms);
    const routeIndices = nearestNeighborTSP(distanceMatrix);

    // Create the route with actual farm data
    const route = routeIndices.map(index => {
      if (index >= 0 && index < farms.length) {
        return {
          farm_id: farms[index].FARM_ID,
          farm_name: farms[index].FARM_NAME,
          farmer_name: farms[index].FARMER_NAME,
          municipality: farms[index].MUNICIPALITY,
          ward: farms[index].WARD,
          pending_orders: farms[index].PENDING_ORDERS_COUNT,
          sequence: routeIndices.indexOf(index),
          coordinates: {
            latitude: farms[index].LATITUDE,
            longitude: farms[index].LONGITUDE
          }
        };
      }
      return null;
    }).filter(Boolean);

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < routeIndices.length - 1; i++) {
      const fromIndex = routeIndices[i];
      const toIndex = routeIndices[i + 1];
      totalDistance += distanceMatrix[fromIndex][toIndex];
    }

    const estimatedTimeMinutes = Math.round((totalDistance / 40) * 60);

    res.status(200).json({
      success: true,
      data: {
        route: route,
        summary: {
          total_farms: farms.length,
          total_pending_orders: farms.reduce((sum, farm) => sum + farm.PENDING_ORDERS_COUNT, 0),
          total_distance_km: Math.round(totalDistance * 100) / 100,
          estimated_time_minutes: estimatedTimeMinutes
        }
      }
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

module.exports = {
  getPlan,
  getUserFarmsRoute,
  getFarmsWithPendingOrdersRoute
};