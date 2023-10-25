# Express.js Server for Cryptocurrency and database Operations

This README provides an overview of an Express.js server that is designed to handle various cryptocurrency-related operations. It includes features such as rate limiting, caching, and specific routes for generating wallets, tipping, and minting NFTs.

## Express.js and Middleware

The server uses Express.js and several middleware components for handling incoming requests. Here's a brief description of the key components:

- **express**: The core module for creating the Express.js application.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing.
- **rateLimit**: Middleware to limit the number of requests from a specific IP address.
- **slowDown**: Middleware to introduce delays in responses after a certain number of requests.
- **helmet**: Middleware for setting HTTP response headers for security.
- **compression**: Middleware for compressing server responses.
- **dotenv**: A library for loading environment variables from a `.env` file.
- **body-parser**: Middleware for parsing request bodies as JSON.

## Configuration

You can configure the server using environment variables defined in a `.env` file. The server listens on the specified port (default is 9001).

## Database Connection

The server connects to a MongoDB database using the `connectToDb` function, which initializes a database connection. This connection is established when the server starts.

## Routes

### Test Route

- Route: `/testme`
- This route is designed for testing purposes.

### Wallet Generation Route

- Route: `/generateWallet`
- This route allows users to generate cryptocurrency wallets associated with their Telegram IDs.
- It checks if a user with the provided Telegram ID already exists in the database and creates a new wallet if not.

### Tipping Route

- Route: `/tip`
- This route enables users to tip cryptocurrency to other users.
- It checks if the sender's Telegram ID exists in the database and transfers cryptocurrency if the user is found.

### NFT Minting Route

- Route: `/mint`
- This route is used for minting NFTs.
- It checks if the sender's Telegram ID exists in the database and mints an NFT if the user is found.
- The route takes in the contract address and NFT URI for minting.

## Wallet Creation

The `walletCreation` function uses the Tatum SDK to generate cryptocurrency wallets. It returns the generated wallet's address and private key. Wallets are generated based on the XDC Testnet.

## TIP Operation

The TIP operation allows users to send cryptocurrency to others. It uses the Ankr JSON RPC provider to send cryptocurrency transactions.

## NFT Minting

The NFT minting operation enables users to mint NFTs on the XDC Testnet. It uses the provided contract address and NFT URI to mint NFTs.


### Encrypting Private Key

The private key used for cryptocurrency operations is sensitive information that should be stored securely. To enhance security, this server uses RSA encryption to protect the private key. Here are the steps to generate and use RSA encryption for the private key:

1. **Generate RSA Key Pair:**

    To generate the RSA key pair, run the following commands using OpenSSL. This will create a 4096-bit RSA private key (`rsa_4096_priv.pem`) and its corresponding public key (`rsa_4096_pub.pem`).

    ```shell
    openssl genrsa -out rsa_4096_priv.pem 4096
    openssl rsa -pubout -in rsa_4096_priv.pem -out rsa_4096_pub.pem
    ```

    The private key (`rsa_4096_priv.pem`) is used to decrypt and access the sensitive information, while the public key (`rsa_4096_pub.pem`) is used to encrypt the private key.

2. **Encrypt the Private Key:**

    After generating the RSA key pair, you can use the public key (`rsa_4096_pub.pem`) to encrypt the private key. This encrypted private key can be securely stored and only decrypted when needed for cryptocurrency operations.

    The `encrypt` function in the code is responsible for this encryption process. It uses the public key to encrypt the private key before storing it in the database.

By following these steps, you ensure that the private key is protected and can only be accessed by authorized processes using the appropriate decryption method.

### Note

This README provides an overview of the server's key features and operations. For a more detailed understanding of the code and how to set up the server, please refer to the code comments and make sure to configure the necessary environment variables.