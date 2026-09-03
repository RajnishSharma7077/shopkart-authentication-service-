const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Customer = require('./models/customer.model');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/customers', require('./routes/customer.routes'));

// Basic health
app.get('/', (req, res) => res.json({ ok: true }));

// Not found
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const DEFAULT_PORT = 5001;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

async function seedDemoAccounts() {
  const existing = await Customer.countDocuments();
  if (existing > 0) return;

  const demoAccounts = [
    { fullName: 'Aarav Sharma', email: 'aarav@shopkart.com', password: 'demo123', phone: '9876500001' },
    { fullName: 'Meera Kapoor', email: 'meera@shopkart.com', password: 'demo123', phone: '9876500002' },
    { fullName: 'Rohan Singh', email: 'rohan@shopkart.com', password: 'demo123', phone: '9876500003' },
  ];

  for (const account of demoAccounts) {
    await Customer.create(account);
  }
  console.log('Seeded demo customer accounts');
}

async function connectAndStart() {
  let mongoUri = process.env.MONGO_URI;

  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    } else {
      const memoryMongo = await MongoMemoryServer.create();
      mongoUri = memoryMongo.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to in-memory MongoDB');
    }

    await seedDemoAccounts();
  } catch (err) {
    console.warn('MongoDB connection failed, retrying with in-memory MongoDB.', err.message);

    try {
      const memoryMongo = await MongoMemoryServer.create();
      await mongoose.connect(memoryMongo.getUri());
      console.log('Connected to in-memory MongoDB');
      await seedDemoAccounts();
    } catch (memoryErr) {
      console.warn('Unable to connect to MongoDB or in-memory MongoDB; continuing without a database connection.', memoryErr.message);
    }
  }

  startServer(PORT);
}

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port === 5000) {
      console.warn(`Port ${port} is occupied; retrying on ${DEFAULT_PORT}`);
      startServer(DEFAULT_PORT);
      return;
    }

    console.error('Failed to start server', err);
    process.exit(1);
  });
}

connectAndStart();
