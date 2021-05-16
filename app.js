const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const mongoose = require('mongoose');
const md5 = require('md5');
const _ = require('lodash');
const ejs = require('ejs');
const app = express();


app.use(express.static("background"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: false
}));

// connect with tha mongooseDB
mongoose.connect("mongodb+srv://admin-harsh:Workpass1993@cluster0.uxnku.mongodb.net/maiwaeDB", {
   useUnifiedTopology: true,useNewUrlParser: true
});
// create schema and model that for new variables
const userInfoSchema = {
  email: String,
  password: String,
  fName: String,
  lName: String,
  sName: String,
  sCourse: String,
  bDegree: String,
  bMajor: String,
  compName: String,
  compScore: Number,
  mDegree: String,
  mMajor: String,
  certification: String,
  date: Number,
  month: String,
  year: Number,
  city: String,
  state: String,
  zip: Number
};
const User = mongoose.model("User", userInfoSchema);

const certSchema = {
  name: String,
  cover: String,
  for: String
};
const courseSchema = {
  name: String,
  term: String,
  major: String
};
const profileSchema = {
  name: String,
  req1: String,
  req2: String,
  req3: String
};
const Certification = mongoose.model("Certification", certSchema);
const Competition = mongoose.model("Competition", certSchema);
const Course = mongoose.model("Course", courseSchema);
const Exam = mongoose.model("Exam", certSchema);
const Fprofile = mongoose.model("Fprofile", profileSchema);
const Scholarship = mongoose.model("Scholarship", certSchema);
const Trend = mongoose.model("Trend", certSchema);

const ansSchema = {
  answer: String
};

const Answer = mongoose.model("Answer", ansSchema);
const ans1 = new Answer({
  answer: "this is the test answer"
});

const quesSchema = {
  ques: String,
  ans: [ansSchema]
};
const Question = mongoose.model("Question", quesSchema);





app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.uemail,
    password: md5(req.body.upass),
    fName: req.body.ufname,
    lName: req.body.ulname,
    sName: req.body.usclname,
    sCourse: req.body.usclcours,
    bDegree: req.body.ubachdeg,
    bMajor: req.body.ubachmaj,
    compName: req.body.ucompex,
    compScore: req.body.ucompsc,
    mDegree: req.body.umasdeg,
    mMajor: req.body.umasmaj,
    certification: req.body.ucert,
    date: req.body.udobd,
    month: req.body.udobm,
    year: req.body.udoby,
    city: req.body.ucity,
    state: req.body.ustat,
    zip: req.body.uzip
  });
  newUser.save(function(err) {
    if (!err) {
      res.render("signup");
    }
  });
});



app.get("/", function(req, res) {
  res.render("signup", );
});

app.post("/home", function(req, res) {

  const username = req.body.username;
  const password = md5(req.body.password);
  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {

          res.render("home", {
            fName: foundUser.fName,
            bDegree: foundUser.bDegree,
            bMajor: foundUser.bMajor,
            compName: foundUser.compName,
            compScore: foundUser.compScore,
            mDegree: foundUser.mDegree,
            mMajor: foundUser.mMajor,
            certification: foundUser.certification,
            sName: foundUser.sName,
            sCourse: foundUser.sCourse
          });
        };
      };
    };
  });
});



app.post("/competitions", function(req, res) {
  Competition.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("competitions", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/compexams", function(req, res) {
  Exam.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("compexams", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/certifications", function(req, res) {
  Certification.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("certifications", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/courses", function(req, res) {
  Course.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("courses", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/scholarship", function(req, res) {
  Scholarship.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("scholarship", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/trends", function(req, res) {
  Trend.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("trends", {
        certNames: foundCerts
      });
    }
  });
});

// linked
app.post("/profile", function(req, res) {
  res.render("profile-page", );
});

app.post("/future", function(req, res) {
  Fprofile.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("future", {
        certNames: foundCerts
      });
    }
  });
});

app.get("/post", function(req, res)
{
              Question.find({}, function(err, foundQues)
                    {
                      if (!err)
                       {
                            Answer.find({}, function(err, foundAns)
                            {
                              if (foundAns.length === 0)
                                  {
                                  Answer.insertMany(ans1, function(err)
                                        {
                                        if (!err) {
                                            console.log("success");
                                                  } else {
                                            console.log("no success");
                                                          }
                                        });
                                  } else {
                                          res.render("post", {
                                            certNames: foundQues,
                                            certAns: foundAns
                                          });
                                          }

                            })
                        }
                  });
  });



app.post("/posts", function(req, res) {
  const newQues = new Question({
    ques: req.body.quesbtn
  });
  newQues.save();
  res.redirect("post");
});

// make this like the todolist
// abc answer for the xyz question
app.post("/answer", function(req, res) {

const reply = new Answer({answer: req.body.ansbtn});

const questionId = req.body.questionId;

  console.log("reply sibmitted "+reply);
  console.log("question ID "+questionId);
Question.findOne({_id:questionId},function(err,foundQ){
  if (!err) {

    foundQ.ans.push(reply);
    foundQ.save();
      }

});
res.redirect("post");
});

app.post("/post", function(req,res){
  res.redirect("post");
})

app.post("/trialPost",function(req,res){
const tP = req.body.trial;
console.log(tP);
});



app.listen(process.env.PORT || 3000, function() {
  console.log("Server running at port 3000");
});
