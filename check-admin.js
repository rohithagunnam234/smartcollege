const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcollege';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Super Admin',
        email: 'admin@college.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin created: admin@college.com / admin123');
    } else {
      console.log('Admin exists:', admin.email);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
