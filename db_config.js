const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/onvtech';

mongoose.connect(`${url}`);

const userSchema = new mongoose.Schema({
  
  name: String,
  email: String,
  phone:String,
  password:String,


});

const User = mongoose.model('users', userSchema);
console.log()



module.exports = User;

