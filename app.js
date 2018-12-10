const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  User = require("./models/user"),
  Detail = require("./models/info"),
  mongoose = require("mongoose"),
  LocalStrategy = require("passport-local");
mongoose.connect(
  "mongodb://Rishi:Rishi@localhost/Rishi?authSource=admin",
  { useNewUrlParser: true }
);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(
  require("express-session")({
    secret: "Rishi",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.CurrentUser = req.user;
  next();
});

//middleware to check user login
function isHelogedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
}

app.get("/", (req, res) => res.redirect("/login"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        return res.redirect("/register");
      }
      // console.log(user);
      return res.redirect("/addDetails");
    }
  );
});

app.get("/login", (req, res) => res.render("login"));
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/showDetails",
    failureRedirect: "/login"
  })
);

app.get("/addDetails", isHelogedIn, (req, res) => {
  Detail.find({ "author.id": req.user._id }, (err, detail) => {
    if (err) {
      console.log(err);
      return res.redirect("/addDetails");
    } else if (detail[0] == undefined) {
      console.log("AddDetails");
      return res.render("addDetails");
    } else if (detail[0].author.id != null) {
      console.log("Already have a detail");
      return res.redirect("/showDetails");
    }
  });
});
app.post("/addDetails", isHelogedIn, (req, res) => {
  Detail.create(req.body.Detail, (err, createdDetail) => {
    if (err) return res.redirect("/addDetails");
    else {
      createdDetail.author.id = req.user._id;
      createdDetail.author.username = req.user.username;
      createdDetail.save();
      res.redirect("/showDetails");
    }
  });
});

app.get("/showDetails", isHelogedIn, (req, res) => {
  Detail.find({ "author.id": req.user._id }, (err, detail) => {
    console.log(detail);
    if (err) return res.redirect("/showDetails");
    else if (detail[0] == undefined) {
      console.log("AddDetails");
      return res.render("addDetails");
    } else {
      console.log(detail[0]);
      return res.render("showDetails", { detail: detail[0] });
    }
  });
});

app.get("/logout", (req, res) => {
  req.logout();
  console.log("LoggedOut Successfully");
  res.redirect("/");
});

const Port = process.env.Port || 3001;
app.listen(Port, () => console.log(`Server Started at ${Port}`));
