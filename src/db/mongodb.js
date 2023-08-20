const mongoose = require('mongoose');

// connecting to database

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log('connected sucessfully!')
}).catch((err)=>{
    console.log(err)
});
