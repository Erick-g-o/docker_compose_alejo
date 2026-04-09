const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database connection with retry logic
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectWithRetry = async () => {
  console.log('Attempting to connect to PostgreSQL...');
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Failed to connect to PostgreSQL, retrying in 5 seconds...', err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Services Endpoints
app.get('/services', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM services ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Appointments Endpoints
app.get('/appointments', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, s.name as service_name 
      FROM appointments a 
      JOIN services s ON a.service_id = s.id 
      ORDER BY a.date DESC, a.time DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/appointments', async (req, res) => {
  const { client_name, email, date, time, service_id } = req.body;

  if (!client_name || !email || !date || !time || !service_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO appointments (client_name, email, date, time, service_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [client_name, email, date, time, service_id, 'PENDING']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PENDING', 'DONE', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const currentResult = await pool.query('SELECT status FROM appointments WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const currentStatus = currentResult.rows[0].status;

    // Business Rules:
    // CANCELLED -> cannot go to DONE
    if (currentStatus === 'CANCELLED' && status === 'DONE') {
      return res.status(400).json({ error: 'Cannot mark a cancelled appointment as done' });
    }
    // DONE -> cannot go to CANCELLED
    if (currentStatus === 'DONE' && status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
    }

    const { rows } = await pool.query(
      'UPDATE appointments SET status = $2 WHERE id = $1 RETURNING *',
      [id, status]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
