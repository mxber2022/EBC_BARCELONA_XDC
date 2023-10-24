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


/* 
    This is function for logs - express js middleware
    You can also use this logger for specific route. Example below
    myMongoServer.post('/saveaddress', logger,  (req, res) => { 
    You can create as many logger you want and use in route
    For specific route to use logger: remove myMongoServer.use(logger) from top;
*/
function logger(req, res, next) {
    //console.log("hello for logger, you are accessing: ", req.originalUrl);
    const ipAddress = req.socket.remoteAddress;
    //console.log(ipAddress);


    /* Starts: Winston MongoDb Logger */
    winstonLogger.info(`IP: ${ipAddress}, URL: ${req.originalUrl}`);
    /* Starts: Winston MongoDb Logger */


    next();
}


/* This is the route for testing */
const addressRoute = require('./routes/test'); 
myMongoServer.use('/testme', addressRoute);



/* Post request to store users private key linking to their user telegram id */
