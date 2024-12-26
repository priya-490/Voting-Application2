const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

});


adminSchema.pre('save',async function(next){
    const admin = this;
    if(!admin.isModified('password')){
        return next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password,salt);
        admin.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
});

adminSchema.methods.comparePassword = async function(adminPassword){
    try{
        const isMatch = await bcrypt.compare(adminPassword,this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

module.exports = mongoose.model('Admin', adminSchema);
