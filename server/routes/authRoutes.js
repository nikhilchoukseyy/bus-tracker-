const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Bus = require('../models/Bus');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
const buildSystemEmail = (idValue) => `${idValue.toLowerCase()}@local.bustracker`;

router.post('/register', async (req, res) => {
  try {
    const { name, email, loginId, password, role = 'student', busNumber, busName } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'name and password are required' });
    }

    if (role === 'driver' && !loginId) {
      return res.status(400).json({ message: 'loginId is required for driver' });
    }

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin cannot be created from public register route' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    if (loginId) {
      const existingLoginId = await User.findOne({ loginId: loginId.toUpperCase() });
      if (existingLoginId) {
        return res.status(409).json({ message: 'loginId already exists' });
      }
    }

    const normalizedLoginId = loginId ? loginId.toUpperCase() : '';
    const fallbackEmail = normalizedLoginId ? buildSystemEmail(normalizedLoginId) : '';
    const normalizedEmail = email ? email.toLowerCase() : (fallbackEmail || undefined);

    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      loginId: normalizedLoginId || undefined,
      password: hashedPassword,
      role,
      busNumber: role === 'driver' ? busNumber : undefined,
      busName: role === 'driver' ? busName : undefined
    });

    const token = signToken(user._id);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        busNumber: user.busNumber,
        busName: user.busName
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, loginId, identifier, password } = req.body;
    const normalizedIdentifier = (identifier || loginId || email || '').trim();

    if (!normalizedIdentifier || !password) {
      return res.status(400).json({ message: 'identifier and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { loginId: normalizedIdentifier.toUpperCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        busNumber: user.busNumber,
        busName: user.busName
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

router.post('/admin/seed', async (req, res) => {
  try {
    const { name, loginId, password } = req.body;

    if (!name || !loginId || !password) {
      return res.status(400).json({ message: 'name, loginId and password are required' });
    }

    const hasAdmin = await User.exists({ role: 'admin' });
    if (hasAdmin) {
      return res.status(403).json({ message: 'Admin already exists. Use admin login.' });
    }

    const existingLoginId = await User.findOne({ loginId: loginId.toUpperCase() });
    if (existingLoginId) {
      return res.status(409).json({ message: 'loginId already exists' });
    }

    const normalizedLoginId = loginId.toUpperCase();
    const normalizedEmail = buildSystemEmail(normalizedLoginId);

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists for this admin ID' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      loginId: normalizedLoginId,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin'
    });

    return res.status(201).json({
      message: 'Admin account created',
      user: { id: user._id, name: user.name, loginId: user.loginId, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to seed admin', error: error.message });
  }
});

router.post('/admin/drivers', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create drivers' });
    }

    const { name, loginId, password } = req.body;

    if (!name || !loginId || !password) {
      return res.status(400).json({ message: 'name, loginId and password are required' });
    }

    const existingLoginId = await User.findOne({ loginId: loginId.toUpperCase() });
    if (existingLoginId) {
      return res.status(409).json({ message: 'Driver ID already exists' });
    }

    const normalizedLoginId = loginId.toUpperCase();
    const normalizedEmail = buildSystemEmail(normalizedLoginId);

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists for this driver ID' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = await User.create({
      name,
      loginId: normalizedLoginId,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'driver'
    });

    return res.status(201).json({
      driver: {
        id: driver._id,
        name: driver.name,
        loginId: driver.loginId,
        role: driver.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create driver', error: error.message });
  }
});

router.get('/admin/drivers', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view drivers' });
    }

    const drivers = await User.find({ role: 'driver' })
      .select('name loginId busNumber busName createdAt')
      .sort({ createdAt: -1 });

    return res.json({ drivers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
  }
});

router.put('/driver-bus', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can edit bus details' });
    }

    const busNumber = (req.body.busNumber || '').trim().toUpperCase();
    const busName = (req.body.busName || '').trim();

    if (!busNumber) {
      return res.status(400).json({ message: 'busNumber is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { busNumber, busName },
      { new: true }
    ).select('-password');

    await Bus.findOneAndUpdate(
      { busNumber },
      {
        busNumber,
        busName,
        driverId: user._id,
        driverName: user.name
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update bus details', error: error.message });
  }
});

module.exports = router;
