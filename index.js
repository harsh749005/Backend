const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const AccountModel = require("./model/account");
const app = express();

app.set("view engine", "ejs");
// Middleware to parse JSON and URL-encoded data
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());
app.get("/", (req, res) => {
  res.render("index");
});

app.get('/login',(req,res) =>{
    res.render('login')
})

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  // res.send({name,email,password});
  let Account = await AccountModel.findOne({ email });
  if (Account) return res.status(500).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await AccountModel.create({
        name,
        email,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shsh");
      res.cookie("token", token);
      res.send("registerd");
      console.log(user);
    });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let Account = await AccountModel.findOne({ email });
  if (Account) return res.status(500).send("Something went wrong");

  bcrypt.compare(password, Account.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id });
        res.cookie("token", token);
      res.send("Logged in");
    }
    else{
        res.redirect('/login')
    }
  });
});

const isLoggedIn = (req,res,next) =>{
    if(req.cookies.token === "") res.send("You must be logged in");
    else{
        let data = jwt.verify(req.cookies.token,"shsh")
        req.account = data;
        next();
    }
}

app.get('/profile',isLoggedIn,(req,res)=>{
    res.render('profile',{user:req.account})
    console.log(req.account)
})

const port = 3000;
app.listen(port, (req, res) => {
  console.log(`Server is running on port http://localhost:${port}`);
});
