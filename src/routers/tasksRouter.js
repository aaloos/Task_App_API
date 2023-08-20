const express = require('express');
const router = express.Router();
const auth = require('../middleware/Authentication');

const task = require('../model/task.js');

//Adding new tasks
router.post('/task', auth, async (req, res)=>{
    const addTask = await new task({...req.body,  owner: req.gotUser._id});
    try{
        await addTask.save();
        res.send('Added task successfully!');
    }catch(error){res.status(400).send(error)}
})

//Fetching all tasks
router.get('/tasks', auth, async (req,res) => {
    const filter = {};
    const sort = {};

    if(req.query.completed){
        filter.completed = req.query.completed.toString() === 'true'
    }

    if(req.query.sortby){
        const parts = req.query.sortby.split(':');
        sort[parts[0]] = parts[1] === 'asc'? 1 : -1;
    }
    // return console.log(filter);
    try{
        const allTasks = await task.find({owner: req.gotUser._id, ...filter}, {owner:0}, {limit: req.query.limit ? req.query.limit: 0, skip:req.query.skip ? req.query.skip: 0, sort})
        allTasks.length>0 ? res.send(allTasks) : res.status(404).send('No Tasks Found');
    }catch(e){
        res.send(e);
    }
})

//Updating task by Id
router.patch('/task/:id', auth, async (req,res)=>{
    const toUpdate = Object.keys(req.body);
    try{
        const selectedTask = await task.findOne({_id: req.params.id, owner: req.gotUser._id});
        if(!selectedTask) return res.status(404).send('');
        toUpdate.forEach((val) => {
            selectedTask[val] = req.body[val];
        });
        await selectedTask.save();
        res.send(selectedTask);
    }catch(e){
        res.status(400).send(e);
    }
})

//Deleting Task by Id

router.delete('/task/:_id', auth, async (req,res)=>{
    try{
        const toDlt = await task.findOneAndDelete({_id: req.params, owner: req.gotUser._id});
        if(!toDlt) return res.status(404).send('');

        res.send('deleted successfully!');
    }catch(e){
        res.send(e);
    }
})

module.exports = router;