const express = require('express');
const router = express.Router();


//route GET api/posts
//      Test route
//      Public
router.get('/', (req,res)=> res.send('Posts route'));

module.exports =router;