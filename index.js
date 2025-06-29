const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const app = express()
const User=require('./models/userModel.js')
const port = 3000
app.use(express.json());
app.get('/', (req, res) => {
  res.send('<h1>BubbleBlog</h1>')
})

const MONGODB_URI="mongodb+srv://Astitvazz:9PAFbK7Bq0I2IdN3@cluster0.ejqzy.mongodb.net/BubbleBlog?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET='1234'
//c
const connectToDb=async()=>{
    try {
        await mongoose.connect(MONGODB_URI)
        console.log("connected to mongodb:-)")
    } catch (error) {
        console.log("mongodb not connected!!!--->",error)
    }
}
connectToDb();


//middleware to check token

const checkToken=(req,res,next)=>{
    const token=req.headers['authorization'].split(' ')[1];
    if(!token){
      return res.status(401).json({message:"no token is provided"})
    }

    try {
      const decoded=jwt.verify(token,JWT_SECRET);
      req.user=decoded;
      next();
    } catch (error) {
      return res.status(403).json({message:"Invalid or expired token"})
    }
    
}

//middleware to check is admin or not

const checkAdmin=(req,res,next)=>{
  if(!req.user.role==='admin'){
    return res.status(403).json({message:"admin access only"})
  }
  next();
}





//authControllers
//register a user
app.post('/api/auth/register',async(req,res)=>{
  const {username,email,password,role,avatar,bio}=req.body;
  try{
  const existing=await User.findOne({email:email});
  if(existing){
    return res.status(403).json({message:"user already present"});
  }
  const hashedPassword=await bcrypt.hash(password,10);
  const newUser={
    username,
    email,
    password:hashedPassword,
    role,
    avatar,
    bio
  }
  const user=new User(newUser);
  await user.save();
  res.status(201).json({message:"user registered successfully",user:newUser});
}
catch(error){
  return res.status(501).json({message:"error occured in registration",error:error.message});
}
})

//login the user

app.post('/api/auth/login',async(req,res)=>{
  const {email,password}=req.body;
  try{
  const userToBeValidated=await User.findOne({email:email});
  if(!userToBeValidated){
    return res.status(403).json({message:"User Not Found"});
  }
  const isValid=await bcrypt.compare(password,userToBeValidated.password)
  if(!isValid){
    return res.status(403).json({message:"Invalid credentials"});
  }
  
  const token=await jwt.sign({id:userToBeValidated._id,role:userToBeValidated.role},JWT_SECRET,{expiresIn:'25d'});
  return res.json({Message:"login successful",Token:token});
  }
  catch(error){
    return res.status(403).json({message:"error generating token",error:error.message});
  }
})




//userControllers

app.get('/api/user',checkToken,checkAdmin,async(req,res)=>{
  try{
  const allUsers=await User.find({role:"user"});
  return res.status(201).json(allUsers);
  }
  catch(error){
    return res.status(403).json({message:"error while fetching ",error:error.message});
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
