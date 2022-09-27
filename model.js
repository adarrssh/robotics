const mongoose = require('mongoose'); 
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    FirstName: String,
    MiddleName: String,
    LastName: String,
    email: String,
    role: String,
    salt:String,
    password:String,
})

UserSchema.methods.setPassword = function(password) { 
     
       this.salt = crypto.randomBytes(16).toString('hex'); 
     
        
       this.password = crypto.pbkdf2Sync(password, this.salt,  
       1000, 64, `sha512`).toString(`hex`); 
   }; 
     
   UserSchema.methods.validPassword = function(password) { 
       var password = crypto.pbkdf2Sync(password,  
       this.salt, 1000, 64, `sha512`).toString(`hex`); 
       return this.password === password; 
   }; 
     
   const User = module.exports = mongoose.model('User', UserSchema);