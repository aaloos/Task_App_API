const jwt = require('jsonwebtoken');
const user = require('../model/user.js');


const  auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const searchedUser = await user.findOne({_id: decoded._id, 'tokens.token': token})
        
        
        if(!searchedUser) throw new Error();

        req.gotUser = searchedUser;
        req.token = token;

        next();
    }catch(e){
        res.status(401).send('please authenticate!');
    }
}

module.exports = auth;