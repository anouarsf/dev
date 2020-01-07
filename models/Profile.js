const mongoose =  require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  company:{
    type:String
  },
  location:{
    type:String
  },
  skills:{
    type:[String],
    required:true
  },
  social: {
    youtube:{
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  }
});

module.exports = Profile = mongoose.model('profile' , ProfileSchema)