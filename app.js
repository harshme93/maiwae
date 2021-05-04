const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const mongoose = require('mongoose');
const app = express();
const ejs = require('ejs');

app.use(express.static("background"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:false}));

// connect with tha mongooseDB
mongoose.connect("mongodb+srv://admin-harsh:Workpass1993@cluster0.uxnku.mongodb.net/maiwaeDB", {useNewUrlParser:true});
// create schema and model that for new variables
const userInfoSchema = {
email: String, password:String, fName: String, lName: String, sName:String,sCourse: String, bDegree:String,
bMajor: String,compName:String, compScore:Number  ,mDegree:String,mMajor: String ,certification: String, date: Number, month: String, year: Number, city: String, state: String,
zip: Number
};

const User = mongoose.model("User",userInfoSchema);

const pageSchema = {
  pageName: String,
  pageVar: [userInfoSchema]
}

// create page schema to link the pages with variables and send them

app.get("/",function(req,res){
  res.render("signup",);
})
app.get("/profile",function(req,res){
  res.render("profile-page",);
});



app.get("/competitions",function(req,res){
  res.render("competitions",);
});
app.get("/compexams",function(req,res){
  res.render("compexams",);
});
app.get("/certifications",function(req,res){
  res.render("certifications",);
});
app.get("/courses",function(req,res){
  res.render("courses",);
});
app.get("/scholarship",function(req,res){
  res.render("scholarship",);
});
app.get("/future",function(req,res){
  res.render("future",);
});
app.get("/trends",function(req,res){
  res.render("trends",);
});


app.post("/home",function(req,res){
const user1 = new User({
  email: req.body.uemail, password: req.body.upass, fName: req.body.ufname, lName: req.body.ulname, sName:req.body.usclname,
    sCourse: req.body.usclcours, bDegree:req.body.ubachdeg,bMajor: req.body.ubachmaj, compName:req.body.ucompex, compScore:req.body.ucompsc  ,mDegree:req.body.umasdeg,mMajor: req.body.umasmaj,certification: req.body.ucert, date: req.body.udobd,
    month: req.body.udobm, year: req.body.udoby, city: req.body.ucity, state: req.body.ustat, zip: req.body.uzip
});
user1.save();
console.log("data this saved");
res.redirect("/");
});


// using foreach function and rendering the user data on the page.
app.get("/home",function(req,res){
User.find({},function(err,foundUsers){
  if (!err) {
console.log("I get the data");
foundUsers.forEach(function(foundUser){
  console.log(foundUser.fName);
res.render("home",{ fName:foundUser.fName , bDegree:foundUser.bDegree,bMajor:foundUser.bMajor,
  compName:foundUser.compName, compScore:foundUser.compScore ,mDegree:foundUser.mDegree,
  mMajor:foundUser.mMajor,certification:foundUser.certification,sName:foundUser.sName,
  sCourse:foundUser.sCourse });

});
}
});
});




app.listen(process.env.PORT , function(){
  console.log("Server running at port 3000");
});
