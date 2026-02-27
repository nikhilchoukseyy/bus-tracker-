const mongoose = require('mongoose');
const User = require('../models/User');

exports.connect = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Migrate legacy unique email index so multiple non-email users do not collide on `null`.
  try {
    await User.collection.dropIndex('email_1');
  } catch (_error) {
    // Ignore if index does not exist.
  }

  await User.collection.createIndex(
    { email: 1 },
    {
      unique: true,
      partialFilterExpression: { email: { $type: 'string' } }
    }
  );

  console.log('MongoDB connected');
};
