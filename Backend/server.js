const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser'); 
const app = express()

const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/errors');
const ErrorHandler = require('./utils/errorHandler');
const { initPool } = require('./config/db');


// Setting up .env file variables
dotenv.config();

// Initialize Oracle DB connection pool at server startup
initPool()
  .then(() => console.log('Oracle DB pool initialized'))
  .catch(err => {
    console.error('Failed to initialize Oracle DB pool:', err);
    process.exit(1); // Exit if pool fails
  });

// Permited frontend url
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
}

// Setup body parser
app.use(express.json());
// Setup CrossOriginResourceSharing
app.use(cors(corsOptions));
// Setup cookie parser
app.use(cookieParser());

// Handling Uncaught Exception
process.on('uncaughtException', err => {
  console.log(`ERROR: ${err.stack}`);
  console.log('Shutting down due to uncaught exception');
  process.exit(1);
}) 

// The routes start here
// Import all routes
const auth = require('./routes/userRoutes');
const crops = require('./routes/cropRoutes');
const farm = require('./routes/farmRoutes');
const profile = require('./routes/userProfileRoutes');
const orderRoutes = require('./routes/orderRoutes');
const autoOrder = require('./routes/autoOrderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const routePlanner = require('./routes/routePlannerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const financialRoutes = require('./routes/financialRoutes');

app.use('/api/v1', auth);
app.use('/api/v1', crops);
app.use('/api/v1', farm);
app.use('/api/v1', profile);
app.use('/api/v1', orderRoutes);
app.use('/api/v1/auto-orders', autoOrder);
app.use('/api/v1', deliveryRoutes);
app.use('/api/v1', routePlanner);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', financialRoutes);


// The routes end here

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handling Unhandled Prommise Rejection
process.on('unhandledRejection', err => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to unhandled promise rejection');
  server.close( () => {
    process.exit(1);
  })
}); 