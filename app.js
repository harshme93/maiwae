const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const mongoose = require('mongoose');
const md5 = require('md5');
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

// schema for tasks (certifications)
const certSchema = {
  name: String, cover:String
};
// model for it
const Certification = mongoose.model("Certification",certSchema);


// create page schema to link the pages with variables and send them

app.post("/register",function(req,res){
const newUser = new User({
    email: req.body.uemail, password: md5(req.body.upass)
    , fName: req.body.ufname, lName: req.body.ulname, sName:req.body.usclname,
    sCourse: req.body.usclcours, bDegree:req.body.ubachdeg,bMajor: req.body.ubachmaj, compName:req.body.ucompex, compScore:req.body.ucompsc  ,mDegree:req.body.umasdeg,mMajor: req.body.umasmaj,certification: req.body.ucert, date: req.body.udobd,
    month: req.body.udobm, year: req.body.udoby, city: req.body.ucity, state: req.body.ustat, zip: req.body.uzip
  });
  newUser.save(function(err){
    if (!err) {
      res.render("signup");
    }
  });
});


app.get("/",function(req,res){
res.render("signup",);
});

app.post("/home",function(req,res){

  const username = req.body.username;
  const password = md5(req.body.password);
  User.findOne({email:username}, function(err,foundUser){
    if(err){
      console.log(err);
    }else {
      if (foundUser) {
        if (foundUser.password === password) {

          res.render("home",
          { fName:foundUser.fName , bDegree:foundUser.bDegree,bMajor:foundUser.bMajor,
            compName:foundUser.compName, compScore:foundUser.compScore ,mDegree:foundUser.mDegree,
            mMajor:foundUser.mMajor,certification:foundUser.certification,sName:foundUser.sName,
            sCourse:foundUser.sCourse }
          );
        };
      };
    };
  });
});

app.post("/competitions",function(req,res){
  res.render("competitions",);
});
app.post("/compexams",function(req,res){
  res.render("compexams",);
});

app.post("/certifications",function(req,res){
  Certification.find({},function(err,foundCerts){
    if (!err) {
    res.render("certifications",{ certNames:foundCerts});
    }
  });
});

app.get("/certifications",function(req,res){
});







app.post("/courses",function(req,res){
  res.render("courses",);
});
app.post("/scholarship",function(req,res){
  res.render("scholarship",);
});

app.post("/trends",function(req,res){
  res.render("trends",);
});

// linked
app.post("/profile", function(req,res){
res.render("profile-page",);
});

app.post("/future",function(req,res){
  res.render("future",);
});








app.listen(process.env.PORT || 3000, function(){
  console.log("Server running at port 3000");
});
