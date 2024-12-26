// user data->
// name 
// age
// email
// state
// {username
// password } ->to be asked while logging in the user

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const  userSchema  = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    age:{
        type: Number,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    state:{
        type: String,
        required:true
    },
    username:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
});

userSchema.pre('save',async function(next){
    const user = this;
    if(!user.isModified('password')){
        return next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password,salt);
        user.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword = async function(userPassword){
    try{
        const isMatch = await bcrypt.compare(userPassword,this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

//create person model
const user = mongoose.model('user', userSchema);
module.exports= user;