//require('dotenv/config');
require('dotenv').config({path: '/Users/maharajababu/Documents/Projects/EBC_BARCELONA_XDC/Database_Mongodb/.env'})
const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(process.env.MONGO_DB_URI)
            .then((client) => {
                dbConnection = client.db();
                console.log("MongoDb successfully connected");
                return cb();
            })
            .catch(err => {
                console.log("There is error while connecting to database: ", err);
                cb(err);
            })
    },
 
    getDb: () => dbConnection
    
};