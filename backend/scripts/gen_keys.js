const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();
const targetPath = path.join(__dirname, '../vapid_keys.json');
fs.writeFileSync(targetPath, JSON.stringify(vapidKeys, null, 2));

console.log(`VAPID keys generated and saved to ${targetPath}`);
console.log('IMPORTANT: Update your .env file with these keys if you want to use them in the application.');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
