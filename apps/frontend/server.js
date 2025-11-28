const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://backend:5000';

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compression
app.use(morgan('combined')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'frontend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Home page
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/stats`, {
      timeout: 5000
    });
    res.render('index', {
      title: 'Microservices Dashboard',
      stats: response.data
    });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.render('index', {
      title: 'Microservices Dashboard',
      stats: { error: 'Unable to fetch backend data' }
    });
  }
});

// Users list page
app.get('/users', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/users`, {
      timeout: 5000
    });
    res.render('users', {
      title: 'Users',
      users: response.data.users || []
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.render('users', {
      title: 'Users',
      users: [],
      error: 'Unable to fetch users'
    });
  }
});

// API proxy endpoints
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/users`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/users`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Backend API URL: ${BACKEND_API_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
