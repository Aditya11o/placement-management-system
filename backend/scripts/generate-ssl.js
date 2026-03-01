const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(process.cwd(), 'ssl');
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
}

try {
    console.log('Generating RSA-2048 keys and X.509 certificate via node-forge...');

    // Generate RSA key pair
    const keys = forge.pki.rsa.generateKeyPair(2048);

    // Create a new certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // 1-year cert

    // Define attributes
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Self-sign the certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // Format to PEM
    const pemPrivateKey = forge.pki.privateKeyToPem(keys.privateKey);
    const pemCert = forge.pki.certificateToPem(cert);

    const keyPath = path.join(sslDir, 'key.pem');
    const certPath = path.join(sslDir, 'cert.pem');

    fs.writeFileSync(keyPath, pemPrivateKey, 'utf8');
    fs.writeFileSync(certPath, pemCert, 'utf8');

    console.log('✅ Local SSL certificates correctly generated inside /ssl/');
} catch (error) {
    console.error('❌ Failed to construct SSL certificates:', error);
}
