const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    // Use in-memory MongoDB for development if no valid URI or connection fails
    if (process.env.NODE_ENV === 'development' && (!mongoUri || mongoUri.includes('cluster0.mongodb.net'))) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Using in-memory MongoDB for development');
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.warn('Continuing without database connection...');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;