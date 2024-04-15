const axios = require('axios');

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({path: path.resolve('.env')});

module.exports.getUser = async function (req, res) {
    try {
        console.log('req._user : ', req._user);
        res.json({user: req._user});
    } catch (error) {
        res.status(500).send('Error getUser : ' + error);
    }
}
