const Bus = require('../models/Bus');

module.exports = (io) => {
  const activeDrivers = {};

  io.on('connection', async (socket) => {
    console.log('New connection:', socket.id);

    try {
      const activeBuses = await Bus.find({ isActive: true });
      socket.emit('buses:all', activeBuses);
    } catch (error) {
      console.error('Failed to load active buses:', error.message);
    }

    socket.on('driver:start', async ({ busNumber, busName, driverName, driverId }) => {
      if (!busNumber) {
        return;
      }

      const normalizedBusNumber = busNumber.toUpperCase();
      activeDrivers[socket.id] = normalizedBusNumber;

      try {
        await Bus.findOneAndUpdate(
          { busNumber: normalizedBusNumber },
          {
            busNumber: normalizedBusNumber,
            busName,
            driverName,
            driverId,
            isActive: true
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

      } catch (error) {
        console.error('driver:start failed:', error.message);
      }

      io.emit('bus:online', { busNumber: normalizedBusNumber, busName, driverName });
    });

    socket.on('driver:updateLocation', async ({ busNumber, busName, lat, lng, driverName }) => {
      if (!busNumber || typeof lat !== 'number' || typeof lng !== 'number') {
        return;
      }

      const normalizedBusNumber = busNumber.toUpperCase();
      const updatedAt = new Date();

      try {
        await Bus.findOneAndUpdate(
          { busNumber: normalizedBusNumber },
          {
            busNumber: normalizedBusNumber,
            busName,
            driverName,
            isActive: true,
            currentLocation: { lat, lng, updatedAt }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

      } catch (error) {
        console.error('driver:updateLocation failed:', error.message);
      }

      io.emit('bus:locationUpdated', {
        busNumber: normalizedBusNumber,
        busName,
        lat,
        lng,
        driverName,
        updatedAt
      });
    });

    socket.on('driver:stop', async ({ busNumber }) => {
      if (!busNumber) {
        return;
      }

      const normalizedBusNumber = busNumber.toUpperCase();

      try {
        await Bus.findOneAndUpdate({ busNumber: normalizedBusNumber }, { isActive: false });
      } catch (error) {
        console.error('driver:stop failed:', error.message);
      }

      io.emit('bus:offline', { busNumber: normalizedBusNumber });
      delete activeDrivers[socket.id];
    });

    socket.on('disconnect', async () => {
      const busNumber = activeDrivers[socket.id];

      if (busNumber) {
        try {
          await Bus.findOneAndUpdate({ busNumber }, { isActive: false });
        } catch (error) {
          console.error('disconnect cleanup failed:', error.message);
        } finally {
          io.emit('bus:offline', { busNumber });
          delete activeDrivers[socket.id];
        }
      }
    });
  });
};
