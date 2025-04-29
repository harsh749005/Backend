const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const AccountModel = require("./model/account");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, bytes) {
      const fn = bytes.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});
const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let Account = await AccountModel.findOne({ email });
  if (Account) return res.status(400).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await AccountModel.create({
        name,
        email,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shsh");
      res.cookie("token", token);
      res.send("Registered successfully");
    });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let Account = await AccountModel.findOne({ email });
  if (!Account) return res.status(400).send("User not found");

  bcrypt.compare(password, Account.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: Account._id }, "shsh");
      res.cookie("token", token);
      res.send("Logged in");
    } else {
      res.redirect("/login");
    }
  });
});

const isLoggedIn = (req, res, next) => {
  if (!req.cookies.token) return res.status(401).send("You must be logged in");

  try {
    const data = jwt.verify(req.cookies.token, "shsh");
    req.account = data;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
};

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.account });
});

app.get("/test", (req, res) => {
  res.render("test");
});

app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file);
  res.send("File uploaded successfully");
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
