const express = require('express');
const router = new express.Router();
const user = require('../model/user.js');
const auth = require('../middleware/Authentication.js');
const task = require('../model/task.js')


// Adding/Signing Up new users
router.post('/user', async (req, res)=>{
    const newUser =  new user(req.body)
    try{
        await newUser.save();
        const signToken = await newUser.getToken(); 
        res.status(201).send({newUser, signToken})
    }catch(e){res.status(400).send(e)}
})

//Logging in users
router.post('/user/login', async (req, res) =>{
    try{
        const loggedUser = await user.findByCredentials(req.body.email, req.body.password);
        const logToken = await loggedUser.getToken();
        res.send({loggedUser, logToken});
    }catch(e){
        res.status(400).send(e);
    }
})

//Logging out User
router.post('/user/logout', auth, async (req, res) =>{
    try{
        req.gotUser.tokens = req.gotUser.tokens.filter((token) =>{
            return token.token !== req.token;
        })
        await req.gotUser.save();
        res.send('');
    }catch(e){
        res.status(500).send(e);
    }
})

//Logging out user from all platform
router.post('/user/logout/all', auth, async (req, res)=>{
    try{
        req.gotUser.tokens = [];
        await req.gotUser.save();
        res.send('');
    }catch(e){
        res.status(500).send(e);
    }
})


//uploading profile avator
const multer = require('multer');   // npm package for handeling file upload in nodejs
const sharp = require('sharp');    // npm package for processing and changing image formats
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error("please upload png file"));
        }
        cb(null, true);
    }
})
router.post('/user/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize(500, 500).png().toBuffer()
    req.gotUser.avatar = buffer;
    await req.gotUser.save();
    console.log(req.gotUser.avatar.binary)
    res.send('file uploaded successfully!')
},(error, req, res, next)=>{
    res.status(400).send(error.message);
})

//fetching avatar
router.get('/user/:id/avatar', async (req, res)=>{
    try{
        const selectedAvatar = await user.findById(req.params.id);
        if(!selectedAvatar || !selectedAvatar.avatar) throw new Error();
        res.set('Content-Type', 'image/png')
        res.send(selectedAvatar.avatar);
    }catch(e){
        res.status(400).send(e)
    }
})

//removing avatar
router.delete('/user/avatar', auth, async (req, res)=>{
    req.gotUser.avatar = undefined;
    await req.gotUser.save();
    req.send()
})

//Fetching user 
router.get('/user', auth, async (req,res)=>{
    res.send(req.gotUser);
})


//update user by id
router.patch('/user/me', auth, async (req,res)=>{
    const toUpdate = Object.keys(req.body);
    const canModify = ["name", "password"];
    var x = toUpdate.every((val)=>{
        return canModify.includes(val);
    })
    if(!x) return res.status(400).send('cannot modify this value');
    try{
        const selectedUser = await req.gotUser;
        toUpdate.forEach((val) => selectedUser[val] = req.body[val]);
        await selectedUser.save();
        res.send(selectedUser);
    }catch(e){
        res.status(400).send(e);
    }
})

//Delete User
router.delete('/user/me', auth, async (req, res)=>{
    try{
        await task.deleteMany({owner: req.gotUser._id});
        await user.findByIdAndRemove( req.gotUser._id);
        res.send(req.gotUser);
    }catch(e){
        res.send(e);
    }
})

module.exports = router