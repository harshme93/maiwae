require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { spawn } = require('child_process');
const { ifError } = require('assert');

const app = express();

app.use(express.static("background"));
app.set("view engine", "ejs");
app.use(express.urlencoded({
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
mongoose.connect(process.env.DB_LINK, {
  useUnifiedTopology: true,
  useNewUrlParser: true, useFindAndModify: false
});
mongoose.set("useCreateIndex", true);

const mentorSchema = { MentName: String, MentId: String };
const Mentor = mongoose.model("Mentor", mentorSchema);
const Mentee = mongoose.model("Mentee", mentorSchema);
const MenteeReq = mongoose.model("MenteeReq", mentorSchema);

// added mongoose schema
const userInfoSchema = new mongoose.Schema({
  username: String, password: String, fName: String, lName: String, sName: String, sCourse: String, bDegree: String, bMajor: String,
  compName: String, compScore: Number, mDegree: String, mMajor: String, certification: String, date: Number, month: String, year: Number,
  city: String, state: String, zip: Number, futProfile: String, fReq1: String, fReq2: String, fReq3: String, futFellow: String,
  futCerti: String, futDeg: String, futMajor: String, futComp: String, futExam: String, futTrend: String, courseRecA: String, courseRecB: String,
  courseRecC: String, courseRecD: String, courseRecE: String, courseCertA: String, courseCertB: String, courseCertC: String, courseCertD: String,
  courseCertE: String, Ment: [mentorSchema], Menti: [mentorSchema], MentiReq: [mentorSchema], Mentor_Name: String, Mentor_Bachelor: String, Mentor_Master: String, Mentor_FutProfile: String
});

userInfoSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userInfoSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const certSchema = { certNam: String, certDes: String, certReq: String };
const courseSchema = { degTyp: String, degNam: String, degElg: String, degMjr: String, degTrm: String, degDes: String };
const profileSchema = { name: String, req1: String, req2: String, req3: String };
const examSchema = { exNam: String, exElg: String, exPro: String };
const compSchema = { name: String, cover: String, for: String };
const scholSchema = { name: String, cover: String, for: String };
const trendSchema = { name: String, cover: String, for: String };
const Certification = mongoose.model("Certification", certSchema);
const Competition = mongoose.model("Competition", compSchema);
const Course = mongoose.model("Course", courseSchema);
const Exam = mongoose.model("Exam", examSchema);
const Fprofile = mongoose.model("Fprofile", profileSchema);
const Scholarship = mongoose.model("Scholarship", scholSchema);
const Trend = mongoose.model("Trend", trendSchema);

const ansSchema = { answer: String };
const Answer = mongoose.model("Answer", ansSchema);

const ans1 = new Answer({ answer: "this is the test answer" });

const quesSchema = { ques: String, ans: [ansSchema] };
const Question = mongoose.model("Question", quesSchema);

const messageSchema = { message: String, writer: String };
const Message = mongoose.model("Message", messageSchema);

const chatSchema = { userOneId: String, userTwoId: String, mess: [messageSchema] };
const Chat = mongoose.model("Chat", chatSchema);

app.get("/", function (req, res) {
  res.render("signup",);
});

app.get("/home", function (req, res) {

  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, foundUser) {

      res.render("home", {
        fName: foundUser.fName, lName: foundUser.lName, sName: foundUser.sName, sCourse: foundUser.sCourse, bDegree: foundUser.bDegree,
        bMajor: foundUser.bMajor, compName: foundUser.compName, compScore: foundUser.compScore, mDegree: foundUser.mDegree,
        mMajor: foundUser.mMajor, certification: foundUser.certification, date: foundUser.date, month: foundUser.month,
        year: foundUser.year, city: foundUser.city, state: foundUser.state, zip: foundUser.zip, futProfile: foundUser.futProfile,
        fReq1: foundUser.fReq1, fReq2: foundUser.fReq2, fReq3: foundUser.fReq3, futFellow: foundUser.futFellow, futCerti: foundUser.futCerti,
        futDeg: foundUser.futDeg, futMajor: foundUser.futMajor, futComp: foundUser.futComp, futExam: foundUser.futExam,
        futTrend: foundUser.futTrend, Mentors: foundUser.Ment, Mentlen: foundUser.Ment.length, Mentees: foundUser.Menti, Mentilen: foundUser.Menti.length,
        MenteeReqs: foundUser.MentiReq
      });
    })
  } else {
    res.redirect("/");
  }
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      })
    }
  })
});

app.post("/login", function (req, res) {
  const user = new User({ username: req.body.username, password: req.body.password });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        if (req.user.fName) {
          res.redirect("home");
        } else {
          res.redirect("/profile");
        }
      })
    }
  })
});

app.get("/profile", function (req, res) {
  res.render("profile-page",);
});

app.post("/profile", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.fName = req.body.ufname; foundUser.lName = req.body.ulname;
      foundUser.sName = req.body.usclname; foundUser.sCourse = req.body.usclcours;
      foundUser.bDegree = req.body.ubachdeg; foundUser.bMajor = req.body.ubachmaj;
      foundUser.compName = req.body.ucompex; foundUser.compScore = req.body.ucompsc;
      foundUser.mDegree = req.body.umasdeg; foundUser.mMajor = req.body.umasmaj;
      foundUser.certification = req.body.ucert; foundUser.date = req.body.udobd;
      foundUser.month = req.body.udobm; foundUser.year = req.body.udoby;
      foundUser.city = req.body.ucity; foundUser.state = req.body.ustat;
      foundUser.zip = req.body.uzip; foundUser.futProfile = req.body.futProfile;
      foundUser.fReq1 = req.body.fReq1; foundUser.fReq2 = req.body.fReq2;
      foundUser.fReq3 = req.body.fReq3; foundUser.futFellow = req.body.futFellow;
      foundUser.futCerti = req.body.futCerti; foundUser.futDeg = req.body.futDeg;
      foundUser.futMajor = req.body.futMajor; foundUser.futComp = req.body.futComp;
      foundUser.futExam = req.body.futExam; foundUser.futTrend = req.body.futTrend;
      foundUser.Mentor_Name = req.body.MentorName; foundUser.Mentor_Bachelor = req.body.MentorBach;
      foundUser.Mentor_Master = req.body.MentorMaster; foundUser.Mentor_FutProfile = req.body.MentorFProfile
      // ,foundUser.Ment[0].MentName= req.body.MentName, foundUser.Ment[0].MentId = req.body.MentId


    };
    // test mentor pushed
    // var test = new Mentor ({MentName:req.body.MentName, MentId:req.body.MentId });
    // foundUser.Ment.push(test);

    foundUser.save(function () {
      res.render("home", {
        fName: req.body.ufname, bDegree: req.body.ubachdeg, bMajor: req.body.ubachmaj, compName: req.body.ucompex, compScore: req.body.ucompsc, mDegree: req.body.umasdeg,
        mMajor: req.body.umasmaj, certification: req.body.ucert, sName: req.body.usclname, sCourse: req.body.usclcours, futProfile: req.body.futProfile, fReq1: req.body.fReq1,
        fReq2: req.body.fReq2, fReq3: req.body.fReq3, futFellow: req.body.futFellow, futCerti: req.body.futCerti, futDeg: req.body.futDeg, futMajor: req.body.futMajor,
        futComp: req.body.futComp, futExam: req.body.futExam, futTrend: req.body.futTrend, Mentor_Name: req.body.MentorName, Mentor_Bachelor: req.body.MentorBach,
        Mentor_Master: req.body.MentorMaster, Mentor_FutProfile: req.body.MentorFProfile
        // ,Mentors: foundUser.Ment 
      });
    })
  })
});



var filteredComps = mongoose.model("filteredComps", compSchema);
app.post("/competitions", function (req, res) {
  filteredComps = [];
  if (req.body.srchInput) {
    const searchString = _.lowerCase([req.body.srchInput]);
    Competition.find({}, function (err, foundCerts) {
      if (!err) {
        foundCerts.forEach(function (foundCert) {
          if (_.lowerCase([foundCert.name]) === (searchString)) {
            filteredComps.push(foundCert);
          }
        });
        res.render("competitions", {
          certNames: filteredComps
        });
      }
    });
  } else {
    Competition.find({}, function (err, foundCerts) {
      if (!err) {
        res.render("competitions", {
          certNames: foundCerts
        });
      }
    });
  }
});

var filteredExams = mongoose.model("filteredExams", examSchema);

app.post("/compexams", function (req, res) {
  filteredExams = [];
  if (req.body.srchInput) {
    const searchString = _.lowerCase([req.body.srchInput]);
    Exam.find({}, function (err, foundCerts) {
      if (!err) {
        foundCerts.forEach(function (foundCert) {
          if (_.lowerCase([foundCert.exNam]) === (searchString)) {
            filteredExams.push(foundCert);
          }
        });
        res.render("compexams", {
          certNames: filteredExams
        });
      }
    });
  }
  else {
    Exam.find({}, function (err, foundCerts) {
      if (!err) {
        res.render("compexams", {
          certNames: foundCerts
        });
      }
    });
  }
});

var filteredCert = mongoose.model("filteredCert", certSchema);

app.post("/certifications", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser.futProfile) {

        filteredCert = [];
        if (req.body.srchInput) {
          const searchString = _.lowerCase([req.body.srchInput]);
          Certification.find({}, function (err, foundCerts) {
            if (!err) {
              foundCerts.forEach(function (foundCert) { if (_.lowerCase([foundCert.certNam]) === (searchString)) { filteredCert.push(foundCert); } });
              res.render("certifications", {
                certNames: filteredCert, courseCertA: foundUser.courseCertA, courseCertB: foundUser.courseCertB, courseCertC: foundUser.courseCertC, courseCertD: foundUser.courseCertD, courseCertE: foundUser.courseCertE
              });
            }
          });
        }
        else {
          Certification.find({}, function (err, foundCerts) {
            if (!err) {
              res.render("certifications", {
                certNames: foundCerts, courseCertA: foundUser.courseCertA, courseCertB: foundUser.courseCertB, courseCertC: foundUser.courseCertC, courseCertD: foundUser.courseCertD, courseCertE: foundUser.courseCertE
              });
            }
          });
        }

      }
      else {
        filteredCert = [];

        if (req.body.srchInput) {
          const searchString = _.lowerCase([req.body.srchInput]);
          Certification.find({}, function (err, foundCerts) {
            if (!err) {
              foundCerts.forEach(function (foundCert) {
                if (_.lowerCase([foundCert.certNam]) === (searchString)) {
                  filteredCert.push(foundCert);
                }
              });
              res.render("certifications", { certNames: filteredCert });
            }
          });
        }

        else {
          Certification.find({}, function (err, foundCerts) { if (!err) { res.render("certifications", { certNames: foundCerts }); } });
        }
      }
    }

  });

});

var filteredCourse = mongoose.model("filteredCourse", courseSchema);

app.post("/courses", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      filteredCourse = [];
      if (req.body.srchInput) {
        const searchString = _.lowerCase([req.body.srchInput]);
        Course.find({}, function (err, foundCerts) {
          if (!err) {
            foundCerts.forEach(function (foundCert) {
              if (_.lowerCase([foundCert.degMjr]) === (searchString)) { filteredCourse.push(foundCert); }
            });
            res.render("courses", { certNames: filteredCourse });
          }
        });
      }
      else {
        Course.find({}, function (err, foundCerts) {
          if (!err) {
            res.render("courses", {
              certNames: foundCerts, courseRecA: foundUser.courseRecA,
              courseRecB: foundUser.courseRecB, courseRecC: foundUser.courseRecC, courseRecD: foundUser.courseRecD,
              courseRecE: foundUser.courseRecE
            });
          }
        });
      }
    }
  });
});


var filteredSchol = mongoose.model("filteredSchol", scholSchema);

app.post("/scholarship", function (req, res) {
  filteredSchol = [];
  if (req.body.srchInput) {
    const searchString = _.lowerCase([req.body.srchInput]);
    Scholarship.find({}, function (err, foundCerts) {
      if (!err) {
        foundCerts.forEach(function (foundCert) {
          if (_.lowerCase([foundCert.name]) === (searchString)) {
            filteredSchol.push(foundCert);
          }
        });
        res.render("scholarship", {
          certNames: filteredSchol
        });
      }
    });
  }
  else {
    Scholarship.find({}, function (err, foundCerts) {
      if (!err) {
        res.render("scholarship", {
          certNames: foundCerts
        });
      }
    });
  }
});


var filteredTrends = mongoose.model("filteredTrends", trendSchema);

app.post("/trends", function (req, res) {
  filteredTrends = [];
  if (req.body.srchInput) {
    const searchString = _.lowerCase([req.body.srchInput]);
    Trend.find({}, function (err, foundCerts) {
      if (!err) {
        foundCerts.forEach(function (foundCert) {
          if (_.lowerCase([foundCert.name]) === (searchString)) {
            filteredTrends.push(foundCert);
          }
        });
        res.render("trends", {
          certNames: filteredTrends
        });
      }
    });
  }
  else {
    Trend.find({}, function (err, foundCerts) {
      if (!err) {
        res.render("trends", {
          certNames: foundCerts
        });
      }
    });
  }
});

var filteredFuture = mongoose.model("filteredFuture", profileSchema);

app.post("/future", function (req, res) {
  filteredFuture = [];
  if (req.body.srchInput) {
    const searchString = _.lowerCase([req.body.srchInput]);
    Fprofile.find({}, function (err, foundCerts) {
      if (!err) {
        foundCerts.forEach(function (foundCert) {
          if (_.lowerCase([foundCert.name]) === (searchString)) {
            filteredFuture.push(foundCert);
          }
        });
        res.render("future", {
          certNames: filteredFuture
        });
      }
    });
  }
  else {
    Fprofile.find({}, function (err, foundCerts) {
      if (!err) {
        res.render("future", {
          certNames: foundCerts
        });
      }
    });
  }
});
// chat button from mentors will land them up here which should be visible at the home page
app.get("/notification", function (req, res) {
  console.log("notification working from get");

});

app.post("/mentee", function (req, res) {
  // userRequested is the one who is logged in and mentor is the one I selected
  User.findById(req.body.mentorRequested, function (err, foundMenti) {
    User.findById(req.body.userRequested, function (err, foundUser) {
      if (!err) {
        var test = new MenteeReq({ MentName: foundUser.fName, MentId: req.body.userRequested });
        foundMenti.MentiReq.push(test);
        foundMenti.save();
        res.redirect("home");
      }
    });
  });
});

app.post("/mentors", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    User.find({}, function (err, foundMentors) {
      res.render("mentor", { foundMentors: foundMentors, currentUser: req.user.id })
    })
  })
});


app.post("/futhome", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      var dataToSend;
      // console.log( `-----1----fut profile before course rec ${foundUser.futProfile} \n selecetd profile ${req.body.fprofile}`)
      const python = spawn('python', ['recommend.py', req.body.fprofile]);
      python.stdout.on('data', function (data) {
        // console.log(`printing data as it is ----2----\n ${data}`)
        // data coming from python looks like a string
        dataToSend = data.toString();
        foundUser.futProfile = req.body.fprofile;
        foundUser.fReq1 = req.body.freq1;
        foundUser.fReq2 = req.body.freq2;
        foundUser.fReq3 = req.body.freq3;
        foundUser.courseRecA = dataToSend.split("|")[0];
        foundUser.courseRecB = dataToSend.split("|")[1];
        foundUser.courseRecC = dataToSend.split("|")[2];
        foundUser.courseRecD = dataToSend.split("|")[3];
        foundUser.courseRecE = dataToSend.split("|")[4];
        // console.log(`-----3----- future profile after python run: ${foundUser.futProfile}`);
      });
      python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);

        foundUser.save(function () {
          // console.log(`----4----after save ${foundUser.futProfile}`);
          res.redirect("home");
        })
      });


      var dataToSendCert;
      // console.log( `--------------------fut profile before certificate rec ${foundUser.futProfile} \n selecetd profile ${req.body.fprofile}`)
      const pythonCert = spawn('python', ['recommendcert.py', req.body.fprofile]);
      pythonCert.stdout.on('data', function (data) {
        // console.log(`printing data as it is -----1-----\n ${data}`)
        // data coming from python looks like a string
        dataToSendCert = data.toString();
        foundUser.futProfile = req.body.fprofile;
        foundUser.courseCertA = dataToSendCert.split("|")[0];
        foundUser.courseCertB = dataToSendCert.split("|")[1];
        foundUser.courseCertC = dataToSendCert.split("|")[2];
        foundUser.courseCertD = dataToSendCert.split("|")[3];
        foundUser.courseCertE = dataToSendCert.split("|")[4];
      });
      pythonCert.on('close', (code) => {
        console.log(`child process close all stdio with code from Certrec ${code}`);

        foundUser.save(function () {
          // console.log(`certificate save function here`);
        })
      })




    }
  })
});



app.post("/felhome", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.futFellow = req.body.fFellow;
      foundUser.save(function () { res.redirect("home"); })
    }
  })
});

app.post("/certhome", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.futCerti = req.body.fCerti;
      foundUser.save(function () {
        res.redirect("home");
      })
    }
  })
});

app.post("/courhome", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.futDeg = req.body.ftDeg;
      foundUser.futMajor = req.body.ftMajor;
      foundUser.save(function () {
        res.redirect("home");
      })
    }
  })
});

app.post("/comphome", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.futComp = req.body.fComp;
      foundUser.save(function () {
        res.redirect("home");
      })
    }
  })
});

app.post("/examhome", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.futExam = req.body.fExam;
      foundUser.save(function () {
        res.redirect("home");
      })
    }
  })
});

app.post("/trendhome", function (req, res) {
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      foundUser.futTrend = req.body.fTrend;
      foundUser.save(function () {
        res.redirect("home");
      })
    }
  })
});



// app.post("/mentorRequest", function (req, res) {

//   User.findById(req.user.id, function (err, foundUser) {
//     if (err) { console.log(err); }
//     else {

//       if (foundUser.Ment.length+1 < 4) {
//         User.findById(req.body.mentorRequested, function (err, foundUserMentor) {
//           if (err) { console.log(err); }
//           else {
//             console.log("---------------------");
//             User.findById(req.body.mentorRequested, function (err, MentorFound) {
//               if (err) { console.log(err); }

//               else {
//                 var SameCount = 0;
//                 for (var i = 0; i < foundUser.Ment.length; i++) {
//                   if (foundUser.Ment[i].MentId == req.body.mentorRequested.split(" ").join("")) {
//                     SameCount += 1;
//                     console.log(`Count: ${SameCount} match found, cannot be added`)
//                   }
//                 }

//                 if (SameCount == 0) {
//                   console.log(`Count: ${SameCount} match not found, mentor added`)

//                   var test = new Mentor({ MentName: MentorFound.fName, MentId: req.body.mentorRequested });
//                   foundUser.Ment.push(test);
//                   foundUser.save();
//                   res.redirect("home");
//                 }

//               }
//             })
//           }
//         })
//       }

//      else{
//       res.redirect("home");
//      } 

//  }
//   });
// })

app.post("/menteeAdd", function (req, res) {

  User.findById(req.user.id, function (err, foundUser) {
    if (err) { console.log(err); }
    else {
      if (foundUser.MentiReq.length + 1 < 4) {
        console.log("---------------------");
        var newMentee = req.body.MentId.split(" ").join("")
        User.findById(newMentee, function (err, MentorFound) {
          if (err) { console.log(err); }
          else {
            var SameCount = 0;
            for (var i = 0; i < foundUser.MentiReq.length; i++) {
              if (foundUser.MentiReq[i].MentId == newMentee) {
                SameCount += 1;
                console.log(`Count: ${SameCount} match found, cannot be added`)
              }
            }
            if (SameCount == 1) {
              console.log(`Count: ${SameCount} match not found, mentee added`)
              var test = new Mentee({ MentName: MentorFound.fName, MentId: newMentee });
              foundUser.Menti.push(test);
              console.log(`logging the test varibale here ${test}`)
              var adment = new Mentor({ MentName: foundUser.fName, MentId: foundUser._id });
              MentorFound.Ment.push(adment);
              console.log(`logging info from this point ${adment}`)
              foundUser.save();
              MentorFound.save();
            }
          }
        })
      }
      else {
        res.redirect("home");
      }
    }

    // remove request
    for (let i = 0; i < foundUser.MentiReq.length; i++) {
      var MentIdRemove = req.body.MentId.split(" ").join("")
      if (foundUser.MentiReq[i].MentId == MentIdRemove) {
        User.findOneAndUpdate({ _id: foundUser._id }, { $pull: { MentiReq: { MentId: MentIdRemove } } }, function (err, foundList) {
          if (!err) {
            console.log("deleted from mentee req list");
            res.redirect("home");
          }
        });
      }
    }
  });
})


app.post("/MentorChat", function (req, res) {
  var MentId = req.body.MentId.split(" ").join("");
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < foundUser.Ment.length; i++) {
        if (foundUser.Ment[i].MentId == MentId) {
          Chat.find({}, function (err, foundChat) {
            if (!err) {
              var ChatCount = 0;
              for (let y = 0; y < foundChat.length; y++) {
                if ((foundChat[y].userOneId == foundUser._id && foundChat[y].userTwoId == MentId) || (foundChat[y].userTwoId == foundUser._id && foundChat[y].userOneId == MentId)) {
                  var ChatMessage = foundChat[y].mess;
                  ChatCount += 1;
                } else { }
              }
              if (ChatCount == 1) {
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Ment[i], ChatMessage: ChatMessage });
              } else {
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Ment[i] });
              }
            } else { console.log(err); }
          })
        } else { };
      }
    }
  });
});

app.post("/MenteeChat", function (req, res) {
  var MentId = req.body.MentId.split(" ").join("");
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < foundUser.Menti.length; i++) {
        if (foundUser.Menti[i].MentId == MentId) {
          Chat.find({}, function (err, foundChat) {
            if (!err) {
              var ChatCount = 0;
              for (let y = 0; y < foundChat.length; y++) {
                if ((foundChat[y].userOneId == foundUser._id && foundChat[y].userTwoId == MentId) || (foundChat[y].userTwoId == foundUser._id && foundChat[y].userOneId == MentId)) {
                  var ChatMessage = foundChat[y].mess;
                  ChatCount += 1;
                } else { }
              }
              if (ChatCount == 1) {
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Menti[i], ChatMessage: ChatMessage });
              } else {
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Menti[i] });
              }
            } else { console.log(err); }
          })
        } else { };
      }
    }
  });
});

app.post("/MentorRemove", function (req, res) {
  var MentIdRemove = req.body.MentId.split(" ").join("");
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < foundUser.Ment.length; i++) {
        if (foundUser.Ment[i].MentId == MentIdRemove) {
          User.findOneAndUpdate({ _id: foundUser._id }, { $pull: { Ment: { MentId: MentIdRemove } } }, function (err, foundList) {
            if (!err) {
              console.log("deleted from other lists");
              res.redirect("home");
            }
          });
        }
      }
    }
  });
});

// add: remove yourself from your mentee's contact
app.post("/MenteeRemove", function (req, res) {
  var MentIdRemove = req.body.MentId.split(" ").join("");
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < foundUser.Menti.length; i++) {
        if (foundUser.Menti[i].MentId == MentIdRemove) {
          User.findOneAndUpdate({ _id: foundUser._id }, { $pull: { Menti: { MentId: MentIdRemove } } }, function (err, foundList) {
            if (!err) {
              console.log("deleted from other lists");
              res.redirect("home");
            }
          });
        }
      }
      for (let i = 0; i < foundUser.MentiReq.length; i++) {
        if (foundUser.MentiReq[i].MentId == MentIdRemove) {
          User.findOneAndUpdate({ _id: foundUser._id }, { $pull: { MentiReq: { MentId: MentIdRemove } } }, function (err, foundList) {
            if (!err) {
              console.log("deleted from other lists");
              res.redirect("home");
            }
          });
        }
      }
    }
  });
});

app.post("/MessageSent", function (req, res) {
  var MentId = req.body.mentorId.split(" ").join("");
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < foundUser.Ment.length; i++) {
        if (foundUser.Ment[i].MentId == MentId) {
          Chat.find({}, function (err, foundChat) {
            if (!err) {
              var MessCount = 0;
              var AllMess = "";
              foundChat.forEach(element => {
                if ((element.userOneId == req.body.currentUserId && element.userTwoId == req.body.mentorId) || (element.userTwoId == req.body.currentUserId && element.userOneId == req.body.mentorId)) {
                  var NewMess = new Message({ message: req.body.mess, writer: req.body.currentUserId });
                  element.mess.push(NewMess);
                  element.save();
                  AllMess = element.mess;
                  MessCount += 1;
                } else {
                }
              });
              if (MessCount == 1) {
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Ment[i], ChatMessage: AllMess });
                console.log(`When present-------------: ${AllMess}`);
              } else {
                var mess = new Message({ message: req.body.mess, writer: req.body.currentUserId });
                var newChat = new Chat({ userOneId: req.body.currentUserId, userTwoId: req.body.mentorId, mess: mess });
                newChat.save();
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Ment[i], ChatMessage: newChat.mess });
                console.log(`when not present---------${newChat.mess}`);
              }
            }
          })
        }
      }

      for (let i = 0; i < foundUser.Menti.length; i++) {
        if (foundUser.Menti[i].MentId == MentId) {
          Chat.find({}, function (err, foundChat) {
            if (!err) {
              var MessCount = 0;
              var AllMess = "";
              foundChat.forEach(element => {
                if ((element.userOneId == req.body.currentUserId && element.userTwoId == req.body.mentorId) || (element.userTwoId == req.body.currentUserId && element.userOneId == req.body.mentorId)) {
                  var NewMess = new Message({ message: req.body.mess, writer: req.body.currentUserId });
                  element.mess.push(NewMess);
                  element.save();
                  AllMess = element.mess;
                  MessCount += 1;
                } else {
                }
              });
              if (MessCount == 1) {
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Menti[i], ChatMessage: AllMess });
                console.log(`When present-------------: ${AllMess}`);
              } else {
                var mess = new Message({ message: req.body.mess, writer: req.body.currentUserId });
                var newChat = new Chat({ userOneId: req.body.currentUserId, userTwoId: req.body.mentorId, mess: mess });
                newChat.save();
                res.render("chat", { mentorReq: foundUser, mentorName: foundUser.Menti[i], ChatMessage: newChat.mess });
                console.log(`when not present---------${newChat.mess}`);
              }
            }
          })
        }
      }
    }
  });
});



app.get("/post", function (req, res) {
  Question.find({}, function (err, foundQues) {
    if (!err) {
      Answer.find({}, function (err, foundAns) {
        if (foundAns.length === 0) {
          Answer.insertMany(ans1, function (err) {
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

app.post("/posts", function (req, res) {
  const newQues = new Question({
    ques: req.body.quesbtn
  });
  newQues.save();
  res.redirect("post");
});

app.post("/answer", function (req, res) {
  const reply = new Answer({
    answer: req.body.ansbtn
  });
  const questionId = req.body.questionId;
  Question.findOne({
    _id: questionId
  }, function (err, foundQ) {
    if (!err) {
      foundQ.ans.push(reply);
      foundQ.save();
    }
  });
  res.redirect("post");
});

app.post("/post", function (req, res) {
  res.redirect("post");
})

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
})

app.listen(process.env.PORT || 3000, function () {
  console.log("Server running at port 3000");
});
