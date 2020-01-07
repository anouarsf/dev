const express = require('express');
const request = require ('request');
const config = require ('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require ('express-validator/')

const Profile  = require('../../models/Profile');
const User = require('../../models/User');

//route GET api/Profile/me
//      Test current users profile
//      Private
router.get('/me', auth, async(req,res)=> {
 try{
  const profile = await Profile.findOne ({ user: req.user.id}).populate('user', ['name']);

  if(!profile){
return res.status(400).json({ msg: "There is no profile for this user"});
  }
  res.json(profile);
 } catch(err){
console.err(err.message);
res.status(500).send('Server Error');
 }
});

//route POST api/profile
//      Create or update user profile
//      Private
router.post('/', [ auth, [
  check('status' , 'Status is required').not().isEmpty()
] ], async (req, res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json ({ errors: errors.array() });
  }
const {
  company,
  location,
  skills,
  youtube,
  facebook,
  twitter,
  instagram,
  linkedin
} = req.body;

// Build profile object
const profileFields = {};
profileFields.user = req.user.id;
if (company) profileFields.company = company;
if (location) profileFields.location = location;
if (skills) {
  profileFields.skills = skills.split(',').map(skill => skill.trim());
}
//Build social Object
profileFields.social = {}
if (youtube) profileFields.social.youtube = youtube;
if (twitter) profileFields.social.twitter = twitter;
if (facebook) profileFields.social.facebook = facebook;
if (linkedin) profileFields.social.linkedin = linkedin;
if (instagram) profileFields.social.instagram = instagram;

try{
let profile = await Profile.findOne({ user: req.user.id});

if(profile){
  //Update
  profile = await Profile.findOneAndUpdate({user :req.user.id},                      {$set: profileFields},{new: true});
  return res.json(profile);
}

//Create 
profile = new Profile(profileFields);

await profile.save();
res.json(profile);

}catch (err)
{
console.error(err.message);
res.status(500).send('Server Error');
}}
);
//route GET api/profile
//      Get all profiles
//      Public

router.get('/', async(req, res)=>{
  try {
const profiles = await Profile.find().populate('user', ['name']);
res.json(profiles);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//route GET api/profile/user/:user_id
//      Get profile by user ID
//      Public

router.get('/user/:user_id', async(req, res)=>{
  try {
const profile = await Profile.findOne({ user: req.params.user_id}).populate('user', ['name']);

if(!profile) return res.status(400).json ({ msg: 'Profile not found'});

res.json(profile);
  } catch(err) {
    console.error(err.message);
if(err.kind == 'ObjectId'){
  return res.status(400).json ({ msg: 'Profile not found'});
}
    res.status(500).send('Server Error');
  }
})

//route DELETE api/profile
//      delete profile, users & posts
//      Public

router.delete('/', auth, async(req, res)=>{
  try {
    //@todo -remove users posts

    //Remove profile
await Profile.findOneAndRemove({ user: req.user.id });
// Remove user
await User.findOneAndRemove({ _id: req.user.id });



res.json({ msg: 'User deleted'});
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//route PUT api/profile/experience
//      Add profile experience
//      Public
// router.put('/experience',
//  [
//    auth, [
//      check('title', 'Title is required')
//      .not()
// .isEmpty(),
// check('company', 'Company is required')
//      .not()
// .isEmpty()

// ]
// ], async (req,res)=>{
//   const errors =validationResult(req);
//   if(!errors.isEmpty()){
//     return res.status(400).json({ errors: errors.array()});
//   }


//   const{
//     title,
//     company,
//     description
//   }=req.body;

//   const newExp = {
//     title,
//     company,
//     description
//   }
//   try{
// const profile  = await Profile.findOne({ user: req.user.id });

// profile.experience.unshift(newExp);
// await profile.save();
// res.json(profile);
//   }catch(err){
// console.error(err.message);
// res.status(500).send('Server Error');
//   }
// });

//route GET api/profile/github:username
//      Get user repos from Github
//      Public
router.get('/github/:username', (req, res)=>{
  try{
const options = {
  url :  `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}` , 
  method:'GET',
  headers: { 'user-agent': 'node.js'}
};
request(options, (error, response, body)=>{
  if (error) console.error(error);
  if(response.statusCode !==200){
   return res.status(404).json({ msg:'No Github profile found'})
  }
  res.json(JSON.parse(body));
});




  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})










module.exports =router;