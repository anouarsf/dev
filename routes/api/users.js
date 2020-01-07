const express =require('express');
const router = express.Router();
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult} = require('express-validator/check');
const User = require('../../models/User');
//@route   POST api/users
//@desc    Register user
//@access  Public
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password','Please enter a password with 6 or more characters').isLength({min: 6})
],
async (req, res) => {
  const errors= validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }

  const { name,email,password} = req.body;
 try{

// if the user exists****

let user = await User.findOne({email});

if(user){
  return res.status(400).json({ errors: [{
    msg: 'User already exists'
  }]});
}

  user = new User({
    name,
    email,
    password
  });
  //encrypt password****

  const salt = await bcrypt.genSalt(10);

user.password = await bcrypt.hash(password, salt);  
 await user.save();

  //return jsonweb token to login rightaway after they reg to the site****
 const payload = {
     user: {
       id:user.id
   }
 }

jwt.sign(
  payload, 
  config.get('jwtSecret'),
  { expiresIn:36000000000000},
  (err, token)=>{
    res.json({ token });
  }
  );
 
 } catch(err){
   console.error(err.message);
   res.status(500).send('Server error');
 }
 
});

module.exports = router;