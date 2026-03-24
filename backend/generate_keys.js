const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keyDir = path.join(__dirname, 'config/keys');

// Ensure key directory exists
if (!fs.existsSync(keyDir)) {
  fs.mkdirSync(keyDir, { recursive: true });
}

const generateKeys = () => {
  console.log('Generating 2048-bit RSA key pair...');

  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  const privateKeyPath = path.join(keyDir, 'private.pem');
  const publicKeyPath = path.join(keyDir, 'public.pem');

  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  console.log(`Keys generated successfully:`);
  console.log(`- Private Key: ${privateKeyPath}`);
  console.log(`- Public Key: ${publicKeyPath}`);
  console.log('\nIMPORTANT: These keys are git-ignored and should be kept secure.');
};

generateKeys();
