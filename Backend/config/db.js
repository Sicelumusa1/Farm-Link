// Handle database connection setup
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = () => { mongoose.connect(process.env.DB_URI)
  .then(con => {
  console.log(`MongoDB database connected with host: ${con.connection.host}`);
  });
};

module.exports = connectDB;

