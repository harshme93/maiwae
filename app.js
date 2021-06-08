const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();


app.use(express.static("background"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(session({
  secret: "our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// connect with tha mongooseDB
mongoose.connect("mongodb+srv://admin-harsh:Workpass1993@cluster0.uxnku.mongodb.net/maiwaeDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

// added mongoose schema
const userInfoSchema = new mongoose.Schema({
  username: String,
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
  zip: Number,
  futProfile: String,
  fReq1: String,
  fReq2: String,
  fReq3: String
});

userInfoSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userInfoSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const certSchema = {
  certNam: String,
  certDes: String,
  certReq: String
};
const courseSchema = {
  degTyp: String,
  degNam: String,
  degElg: String,
  degMjr: String,
  degTrm: String,
  degDes: String
};
const profileSchema = {
  name: String,
  req1: String,
  req2: String,
  req3: String
};
const examSchema = {
  exNam: String,
  exElg: String,
  exPro: String
};
const compSchema = {
  name: String,
  cover: String,
  for: String
};
const scholSchema = {
  name: String,
  cover: String,
  for: String
};
const trendSchema = {
  name: String,
  cover: String,
  for: String
};
const Certification = mongoose.model("Certification", certSchema);
const Competition = mongoose.model("Competition", compSchema);
const Course = mongoose.model("Course", courseSchema);
const Exam = mongoose.model("Exam", examSchema);
const Fprofile = mongoose.model("Fprofile", profileSchema);
const Scholarship = mongoose.model("Scholarship", scholSchema);
const Trend = mongoose.model("Trend", trendSchema);

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

app.get("/", function(req, res) {
  res.render("signup", );
});

app.get("/home", function(req, res) {

  if (req.isAuthenticated()) {
    User.findById(req.user.id, function(err, foundUser) {

      res.render("home", {
        fName: foundUser.fName,
        lName: foundUser.lName,
        sName: foundUser.sName,
        sCourse: foundUser.sCourse,
        bDegree: foundUser.bDegree,
        bMajor: foundUser.bMajor,
        compName: foundUser.compName,
        compScore: foundUser.compScore,
        mDegree: foundUser.mDegree,
        mMajor: foundUser.mMajor,
        certification: foundUser.certification,
        date: foundUser.date,
        month: foundUser.month,
        year: foundUser.year,
        city: foundUser.city,
        state: foundUser.state,
        zip: foundUser.zip,
        futProfile: foundUser.futProfile,
        fReq1: foundUser.fReq1,
        fReq2: foundUser.fReq2,
        fReq3: foundUser.fReq3
      });
    })
  } else {
    res.redirect("/");
  }
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      })
    }
  })
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
      if (req.user.fName) {

        res.redirect("home");
      } else {
        res.redirect("/profile");
      }

      })
    }
  })
});

app.get("/profile", function(req, res) {
  res.render("profile-page", );
});

app.post("/profile", function(req, res) {

  const fName = req.body.ufname;
  const lName = req.body.ulname;
  const sName = req.body.usclname;
  const sCourse = req.body.usclcours;
  const bDegree = req.body.ubachdeg;
  const bMajor = req.body.ubachmaj;
  const compName = req.body.ucompex;
  const compScore = req.body.ucompsc;
  const mDegree = req.body.umasdeg;
  const mMajor = req.body.umasmaj;
  const certification = req.body.ucert;
  const date = req.body.udobd;
  const month = req.body.udobm;
  const year = req.body.udoby;
  const city = req.body.ucity;
  const state = req.body.ustat;
  const zip = req.body.uzip;
  const futProfile = req.body.futProfile;
  const fReq1 = req.body.fReq1;
  const fReq2 = req.body.fReq2;
  const fReq3 = req.body.fReq3;


  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.fName = req.body.ufname;
      foundUser.lName = req.body.ulname;
      foundUser.sName = req.body.usclname;
      foundUser.sCourse = req.body.usclcours;
      foundUser.bDegree = req.body.ubachdeg;
      foundUser.bMajor = req.body.ubachmaj;
      foundUser.compName = req.body.ucompex;
      foundUser.compScore = req.body.ucompsc;
      foundUser.mDegree = req.body.umasdeg;
      foundUser.mMajor = req.body.umasmaj;
      foundUser.certification = req.body.ucert;
      foundUser.date = req.body.udobd;
      foundUser.month = req.body.udobm;
      foundUser.year = req.body.udoby;
      foundUser.city = req.body.ucity;
      foundUser.state = req.body.ustat;
      foundUser.zip = req.body.uzip;
      foundUser.futProfile = req.body.futProfile;
      foundUser.fReq1 = req.body.fReq1;
      foundUser.fReq2 = req.body.fReq2;
      foundUser.fReq3 = req.body.fReq3;
      foundUser.save(function() {
        res.render("home", {
          fName: fName,
          bDegree: bDegree,
          bMajor: bMajor,
          compName: compName,
          compScore: compScore,
          mDegree: mDegree,
          mMajor: mMajor,
          certification: certification,
          sName: sName,
          sCourse: sCourse,
          futProfile: futProfile,
          fReq1: fReq1,
          fReq2: fReq2,
          fReq3: fReq3
        });
      })
    }
  })
});

app.post("/competitions", function(req, res) {
  // console.log(req.body.srchInput);
  Competition.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("competitions", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/compexams", function(req, res) {
  // console.log(req.body.srchInput);
  Exam.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("compexams", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/certifications", function(req, res) {
  // console.log(req.body.srchInput);
  Certification.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("certifications", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/courses", function(req, res) {
  // console.log(req.body.srchInput);
  Course.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("courses", {
        certNames: foundCerts
      });
    }
  });
});

// fellowships and internships
app.post("/scholarship", function(req, res) {
  // console.log(req.body.srchInput);
  Scholarship.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("scholarship", {
        certNames: foundCerts
      });
    }
  });
});

app.post("/trends", function(req, res) {
  // console.log(req.body.srchInput);
  Trend.find({}, function(err, foundCerts) {
    if (!err) {
      res.render("trends", {
        certNames: foundCerts
      });
    }
  });
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

app.post("/home",function(req,res){

  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.futProfile = req.body.fprofile;
      foundUser.fReq1  = req.body.freq1;
      foundUser.fReq2 = req.body.freq2;
      foundUser.fReq3 = req.body.freq3;
    foundUser.save(function() {
    res.redirect("home");
    })
    }
    })


});

app.get("/post", function(req, res) {
  Question.find({}, function(err, foundQues) {
    if (!err) {
      Answer.find({}, function(err, foundAns) {
        if (foundAns.length === 0) {
          Answer.insertMany(ans1, function(err) {
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

app.post("/answer", function(req, res) {
  const reply = new Answer({
    answer: req.body.ansbtn
  });
  const questionId = req.body.questionId;
  Question.findOne({
    _id: questionId
  }, function(err, foundQ) {
    if (!err) {
      foundQ.ans.push(reply);
      foundQ.save();
    }
  });
  res.redirect("post");
});

app.post("/post", function(req, res) {
  res.redirect("post");
})



app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server running at port 3000");
});
