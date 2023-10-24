const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

function encrypt(toEncrypt) 
{
    const absolutePath = path.resolve('./src/rsa_4096_pub.pem');
    const publicKey = fs.readFileSync(absolutePath, 'utf8');
    const buffer = Buffer.from(toEncrypt, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);

    return encrypted.toString('base64');
}

/*
function decrypt(toDecrypt) 
{
    const absolutePath = path.resolve('./src/rsa_4096_priv.pem');
    const privateKey = fs.readFileSync(absolutePath, 'utf8')
    const buffer = Buffer.from(toDecrypt, 'base64')
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey.toString(),
        passphrase: '',
      },
      buffer,
    )
    return decrypted.toString('utf8')
}

const dec = decrypt("enc");
console.log('Decryption : ', dec);
*/


module.exports = {encrypt};