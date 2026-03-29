const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connect failed:', err.message);
    process.exit(1);
  });
