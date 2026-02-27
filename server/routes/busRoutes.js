const express = require('express');
const Bus = require('../models/Bus');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const buses = await Bus.find().sort({ busNumber: 1 });
    return res.json(buses);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch buses', error: error.message });
  }
});

router.get('/active', async (_req, res) => {
  try {
    const buses = await Bus.find({ isActive: true }).sort({ busNumber: 1 });
    return res.json(buses);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch active buses', error: error.message });
  }
});

router.get('/:busNumber', async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber.toUpperCase() });

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    return res.json(bus);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch bus', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can create bus entries' });
    }

    const busNumber = (req.body.busNumber || req.user.busNumber || '').toUpperCase();

    if (!busNumber) {
      return res.status(400).json({ message: 'busNumber is required' });
    }

    const bus = await Bus.findOneAndUpdate(
      { busNumber },
      {
        busNumber,
        busName: req.user.busName || '',
        driverId: req.user._id,
        driverName: req.user.name
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(bus);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create bus entry', error: error.message });
  }
});

module.exports = router;
