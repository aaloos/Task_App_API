const mongoose = require('mongoose');
const validator = require('validator');
const passwordValidator = require('password-validator');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

//user Schema
const userSchema = new mongoose.Schema({
    name: {type: String, trim: true},
    email: {type: String, 
        lowercase: true, 
        required: true, 
        unique: true,
        validate(val){ if(!validator.isEmail(val)) {throw new Error('email is invalid');}}
    },
    password: {type: String, required: true, trim: true,
        validate(value) {
            if(!schema.validate(value)){throw new Error('Password must contain 8 characters, uppercase, lowercase, digit')};
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
});

// //virtual task user relationship
// userSchema.virtual('Tasks',{
//     ref: 'task',
//     localField: '_id',
//     foreignField: 'owner'
// })

//fetching user by credentials for loggingin
userSchema.statics.findByCredentials = async (email, password)=>{
    const selectedUser = await user.findOne({email});
    if(!selectedUser) throw new Error('Either email or password is incorrect!');

    const isMatch = await bcrypt.compare(password, selectedUser.password);
    if(!isMatch) throw new Error('Either email or Password is incorrect!');

    return selectedUser;
}

//Generating Authentication Token
userSchema.methods.getToken = async function(){
    const tokenUser = this
    const token = await jwt.sign({"_id": tokenUser.id.toString()}, process.env.JWT_SECRET);
    tokenUser.tokens = [...tokenUser.tokens, {token}];
    await tokenUser.save();
    return token;
}

// middleware for hashing password before saving
userSchema.pre('save', async function(next){
    const newUser = this
    if(newUser.isModified('password')){
        newUser.password = await bcrypt.hash(newUser.password, 8);
    }
    next();
})

//Hiding data before sending back
userSchema.methods.toJSON = function async (){
    const hideUser = this;
    const nUser = hideUser.toObject();

    delete nUser._id;
    delete nUser.password;
    delete nUser.tokens;
    return nUser;
}

// Password Validation 
const schema = new passwordValidator();
schema.is().min(8)                                    
.is().max(100)                                  
.has().uppercase()                              
.has().lowercase()                              
.has().digits(1)                                
.has().not().spaces();



//data model

const user = mongoose.model('user',userSchema)

module.exports = user;