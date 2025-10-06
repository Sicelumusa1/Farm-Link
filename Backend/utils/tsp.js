const ErrorHandler = require('./errorHandler');

function nearestNeighborTSP(distances) {
  // Initialize the number of users(farmers) to visit
  const numUsers = distances.length;

  // If no farms or only one farm
  if (numUsers === 0) return [];
  if (numUsers === 1) return [0, 0];

  // Track the visited farmers
  const visited = Array(numUsers).fill(false);

  // Initialize the route with the starting point (farmer 0)
  const route = [0];
  
  // Mark the starting farmer as visited
  visited[0] = true;

  // Initialize the current farmer
  let currentUser = 0;

  for (let i = 1; i < numUsers; i++) {
    let nearest = -1; // The index of the nearest unvisited farmer
    let nearestDistance = Infinity; // Distance to the nearest farmer

    // Find the nearest unvisited farmer
    for (let j = 0; j < numUsers; j++) {
      if (!visited[j] && distances[currentUser][j] < nearestDistance) {
        nearest = j;
        nearestDistance = distances[currentUser][j];
      }
    }

    // If no nearest found
    if (nearest === -1) break;

    // Add the nearest farmer to the route
    route.push(nearest);
    visited[nearest] = true;
    currentUser = nearest;
  }
    
  route.push(0); // Add the starting point back to close the loop

  // Return the resulting route
  return route;
}

module.exports = nearestNeighborTSP;