const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const router = express.Router();

router.post('/signup' , async(req , res)=>{
    const {username , email , password} = req.body;
    const db = req.app.locals.db;
    const user = await db.collection('miroUsersDb').findOne({email});
    console.log(user);
    if(user){
        return res.json({message : "User already registered"});
    }
    //password hashing
    const hashedPass = await bcrypt.hash(password , 10); //salt =10

    await db.collection('miroUsersDb').insertOne({
        username,
        email , 
        password : hashedPass
    });

    return res.json({message: "User Resgistered Success!"});
});

router.post('/login' , async(req,res)=>{
    console.log(req.body);
    const {email , password} = req.body;
    const db = req.app.locals.db;

    //Find user by email
    const user = await db.collection("miroUsersDb").findOne({email});
    console.log("USER:=> " , user);

    if(user && await bcrypt.compare(password , user.password)){
        const userId = user._id;
        console.log("User Id: " , userId);
        const token = jwt.sign({userId} , 'miroToDoApp' , {expiresIn: '1h'});
        return res.json({token});
    }else{
        return res.status(401).json({message : "Invalid credentials"});
    }
});

module.exports = router;