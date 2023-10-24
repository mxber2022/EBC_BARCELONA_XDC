/* Routes are searched from top to bottom in express js */

const express = require('express');
const router = express.Router();

const {getDb} = require('../mydb');


router.get('/', (req, res) => {

    //console.log(getDb());

    res.json({
        msg: "Testing Mongo db"
    });
});

router.get('/help', (req, res) => {
    res.json({
        msg: "Okay, You are at correct route. Thanks"
    });
});

module.exports = router;