//importing required modules
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const creatures = require("./creatures");
const async = require("async");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')

// making an express application
const app = express();

const port = process.env.PORT || 3000;

// letting express app use other module properties
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
// app.use((req, res, next)=>{
//     console.log("HTTP Method - " + req.method + " , URL - " + req.url);
//     next();
// });

// connecting to database
main().catch(err => console.log(err)); 
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wizardingWorldDB");
}

// creating an authorization middleware
const auth = async(req, res, next) => {
    try {
        const token = req.cookies.userCookie;
        const details = token.split(" ")[1];
        const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
        // console.log(verifyUser);
        const user = await LoginDetail.findOne({_id: verifyUser._id});
        console.log(user);
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}

// creaeting schema to store credential of users in DB
const signupSchema = new mongoose.Schema({
    name : String,
    email: {type: String, unique: true},
    username: {type: String, unique: true},
    password: String,
});
const LoginDetail = new mongoose.model("LoginDetail", signupSchema);

// creating schema to store info magical creatures into DB
const creaturesSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    description: String,
});
const Creature = new mongoose.model("Creature", creaturesSchema);

// creating schema to store favourites of user into DB
const favSchema = new mongoose.Schema({
    name: {type: mongoose.Schema.Types.ObjectId, ref: 'LoginDetail', unique: true},
    favourites:[{type: mongoose.Schema.Types.ObjectId, ref: 'Creature', unique: true}],
});
const Favourite = new mongoose.model("Favourite", favSchema);

// all the get method 

app.get("/", async (req, res) => {
        res.render("home", { btnValue: "Login" });
    });

app.get("/login", function(req, res){
    res.sendFile(__dirname + "/login.html");
});

app.get("/creatures", function(req, res){
    Creature.find({}).then(function(foundItem){
        console.log(foundItem.length);
        res.render("creature", {creatureList: foundItem});
        // res.render("creature");
    });
});

app.get("/:userName", function(req, res){
    const userName = req.params.userName;
    res.send("hello " + userName);
});

// all the post method

app.post("/login", async (req, res)=>{
    const btnValue = req.body.btn;
    console.log(btnValue);
    if(btnValue === "Login"){
        res.redirect("/login");
    }
    else{
        // will display user profile page
        res.redirect("/" + btnValue);
    }
});

// post method to login or signup using JWT
app.post("/", async (req, res) => {
        const btnValue = req.body.btn;
        if (btnValue == "Login") {
            const email = req.body.email;
            const username = req.body.username;
            const password = req.body.password; 

            const existingUser = await LoginDetail.findOne({ email: email, username: username});
            if(existingUser === null){
                res.send("<script>alert('Username of e-mail Id does not exist!');window.location = '/';</script>");
            }   
            const matchPassword = await bcrypt.compare(password, existingUser.password);
            if(!matchPassword){
                res.send("<script>alert('Wrong Password!');window.location = '/';</script>");
            }
            const token = await jwt.sign({ email: existingUser.email, username: existingUser.username, _id: existingUser._id }, process.env.SECRET_KEY, {
                expiresIn: '1h'
            });
            // console.log(existingUser);
            res.cookie("userCookie", token);
            // console.log(req.cookies.userCookie);
            // console.log(token);
            res.render("home", { btnValue: existingUser.username });
        }
        else {
            const name = req.body.personName;
            const email = req.body.email;
            const username = req.body.username;
            const password = req.body.password;

            const foundItem = await LoginDetail.findOne({ email: email });
            if (foundItem) {
                res.send("<script>alert('Username or e-mail already in use! Try using another!');window.location = '/';</script>");
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const details = await LoginDetail.create({
                name: name,
                email: email,
                username: username,
                password: hashedPassword
            });
            const token = jwt.sign({ email: details.email, username: details.username, _id: details._id }, process.env.SECRET_KEY,{
                expiresIn: '1h'
            });
            // res.status(201).json({user: details, token: token});
            res.render("home", { btnValue: details.username });
            // console.log(token);
            // details.save();
        }
    });

app.post("/creatures",function(req,res){
    res.redirect("/creatures");
});

app.post("/quiz", function(req, res){
    res.sendFile(__dirname + "/quiz.html");
});

app.post("/puzzle", function(req, res){
    res.sendFile(__dirname + "/puzzle.html");
});
    
app.post("/xyz", function(req, res){
    const creatureName = _.capitalize(req.body.creatureName);
    Creature.findOne({name: creatureName}).then(function(foundItem){
        res.render("creatureName", {creatureName: creatureName, description: foundItem.description});
    });
});

app.post("/favs", auth, function(req, res){
    const checkItemId = req.body.checkbox;
    // const btnValue = req.body.btnValue;
    // console.log(btnValue);
    // var newFav = new Favourite;
    // newFav.
    console.log(checkItemId);
});

app.post("/exitQuiz", function(req, res){
    const userName = req.body.button;
    console.log(userName);
    // res.redirect("/");
});

app.listen(port, function(){
    console.log("server running on " + port);
    Creature.find({}).then(function(foundItem){
        if(foundItem.length == 0){
            Creature.insertMany(creatures).then(function(err){
                if(!err){
                    console.log("Did not find any creatures, and saved default to DB.");
                }
                else{
                    console.log(err);
                }
            });
        }
    });
});



// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: 'test@example.com',
//   from: 'test@example.com',
//   subject: 'Sending with Twilio SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sgMail.send(msg);