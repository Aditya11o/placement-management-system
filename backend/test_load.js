try {
  console.log('Loading User model...');
  require('./models/User');
  console.log('Loading authController...');
  require('./controllers/authController');
  console.log('Loading jobController...');
  require('./controllers/jobController');
  console.log('Loading applicationController...');
  require('./controllers/applicationController');
  console.log('All modules loaded successfully');
} catch (error) {
  console.error('Module loading failed:');
  console.error(error);
  process.exit(1);
}
