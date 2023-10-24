/* Express js uses : top to bottom approach */
/* Rate Limiting and Caching*/
const express = require('express');
const myMongoServer = express();
const cors = require("cors");

const rateLimit = require('express-rate-limit');
const slowDown = require("express-slow-down");
const helmet = require("helmet");
const compression = require("compression");
require('dotenv/config');
const { connectToDb, getDb} = require('./mydb');
const { ServerApiVersion, Db } = require('mongodb');

const { encrypt } = require('./encrypme');

const { TatumSDK, Xdc, Network, XinFin } = require('@tatumio/tatum');
const { EvmWalletProvider } = require("@tatumio/evm-wallet-provider");

var bodyParser = require('body-parser');

/* Middleware to get request body - post request*/
myMongoServer.use(compression());
myMongoServer.use(express.json());
//myMongoServer.use(logger);
myMongoServer.use(helmet());
myMongoServer.disable('x-powered-by');

myMongoServer.use(cors({
    origin: "*",
    methods: ["POST"],
}))

const PORT = process.env.PORT || 9001;
/* database connection */
let db;

connectToDb((err) => {
    if(!err) {
        myMongoServer.listen(PORT, () => {
            console.log(`myMongoServer listening on port ${PORT}`);
        });

        db = getDb();
    }
})

/*
    This function helps to limit number of request sent by specifiic IP address. Note: This is used globally for all requests.
    You can add proxy later if used later.
*/
const limiter  = rateLimit({
    windowMs: 60 * 1000, //Every 60 seconds 10 requests
    max: 10,
});

myMongoServer.use(limiter);

/*
    This function helps to delay response.
*/
const speedLimiter = slowDown({
    windowMs: 60 * 1000, // 1 minutes
    delayAfter: 5, // allow 5 requests per 1 minutes, then...
    delayMs: 50000 // begin adding 50000 ms(50 second) of delay per request above 5:
});
  
myMongoServer.use(speedLimiter);


/* Accept request only in JSON format */
myMongoServer.use(bodyParser.json()) ;

/* This is the route for testing */
const addressRoute = require('./routes/test'); 
myMongoServer.use('/testme', addressRoute);


/* 
    Post request to store users private key linking to their user telegram id 
*/
myMongoServer.post('/generateWallet', async(req, res) => {
    //console.log("req: ", req);
    let TELEGRAM_ID = "";
    if(req.body.TID != null) {
        TELEGRAM_ID = String(req.body.TID);
    }

    const temp = await walletCreation();
    console.log("temp1: ", temp.addressFromMnemonic);
    console.log("temp2: ", temp.privateKey);

    
    const existingUser = await db.collection('whitelist').findOne({ TELEGRAM_ID: TELEGRAM_ID });
    if (existingUser) {
        // TELEGRAM_ID already exists in the database
        return res.status(400).json("Wallet already exists");
    }


    db.collection('whitelist')
        .insertOne({
            TELEGRAM_ID: TELEGRAM_ID,
            PRIVATE_KEY: temp.privateKey,
            PUBLIC_KEY: temp.addressFromMnemonic,
            date: Date(),
        })
        .then(result => {
            //res.status(201).json(result); //changing default response see below
            res.status(201).json(temp.addressFromMnemonic);
           // console.log("done", result);
        })
        .catch(err => {
            res.status(500).json({err: 'failure to save email to database'})
            console.log("not done");
    });

});


async function walletCreation() {
    try {
        const tatumSdk = await TatumSDK.init({ network: Network.XDC_TESTNET,
        configureWalletProviders: [
            EvmWalletProvider,
        ]
        });
        const mnemonic = await tatumSdk.walletProvider.use(EvmWalletProvider).generateMnemonic();
        console.log(mnemonic);

        const privateKey = await tatumSdk.walletProvider.use(EvmWalletProvider).generatePrivateKeyFromMnemonic(mnemonic, 0);
        console.log(privateKey);

        const addressFromMnemonic = await tatumSdk.walletProvider.use(EvmWalletProvider).generateAddressFromMnemonic(mnemonic, 0);
        console.log(addressFromMnemonic);

        //return addressFromMnemonic, privateKey;
        return {
            addressFromMnemonic: addressFromMnemonic,
            privateKey: privateKey
        };
    } 
    catch (error) {
        console.error("Error generating mnemonic:", error);
    }
}