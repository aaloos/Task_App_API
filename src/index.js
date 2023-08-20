require('./db/mongodb.js');
const user = require('./model/user.js');

const userRouter = require('./routers/userRouter.js');   //User Routes
const tasksRouter = require('./routers/tasksRouter.js');   //User Routes




const express = require('express');
const app = express();
var port = process.env.PORT

app.use(express.json());
app.use(userRouter);             //User Routes
app.use(tasksRouter);             //Tasks Routes






// Setting up server
app.listen(port,()=>{
    console.log('server is up on port' + port)
});

