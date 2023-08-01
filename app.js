//importing required modules
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const creatures = require("./creatures");
const data = require("./creatures");
const async = require("async");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')
const { populate } = require('dotenv');

// making an express application
const app = express();

const port = process.env.PORT || 3000;

// letting express app use other module properties
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname +  "/public"));
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
        const { userCookie } = req.cookies;
        if (!userCookie || userCookie === '') {
            res.send("<script>alert('Please login to access!');window.location = '/';</script>");
            // return res.status(401).json({ message: 'Token not found, please login again!'});
        }
        else{
            jwt.verify(userCookie, process.env.SECRET_KEY, (err, decoded) => {
                if (err) {
                  res.send("<script>alert('Invalid Token!');window.location = '/';</script>");
                }
                req.decoded = decoded;
            });
            next();
        }
    } catch (err) {
        res.send("<script>alert('Please Login!');window.location = '/';</script>");
    }
}

// creaeting schema to store credential of users in DB
const signupSchema = new mongoose.Schema({
    name : String,
    email: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
    },
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
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'LoginDetail', unique: true},
    favourites:[
        {
            creatureName: String,
        },
    ],
});
const Favourite = new mongoose.model("Favourite", favSchema);

// all the get method 


app.get("/", async (req, res) => {
    console.log("Get request recived!");
    try {
        const { userCookie } = req.cookies;
        console.log('userCookie: ', userCookie); // dev 
        if (!userCookie || userCookie === '') {
            console.log(".");
            res.render("home", {btnValue: "Login" });
        }
        jwt.verify(userCookie, process.env.SECRET_KEY, (err, decoded) => {
          if (err) {
            console.log("..", err);
            res.render("home", {btnValue: "Login" });
          }else{
            console.log("....")
            res.render("home", {btnValue: decoded.username});
          }
        });
    } catch (err) {
        console.log("err: ", err);
        res.render("home", {btnValue: "Login" });
    }
});

app.get("/login", function(req, res){
    res.sendFile(__dirname + "/login.html");
});

app.get("/creatures", auth, async(req, res) => {
    const foundItems = await Creature.find({});
    res.render("creature", {creatureList: foundItems});
});

app.get('/api/data', (req, res) => {
    res.json(data);
});

app.get("/gryffindor", auth, async(req, res) => {
    res.sendFile(__dirname + "/Gryffindor-house.html");
});

app.get("/hufflepuff", auth, async(req, res) => {
    res.sendFile(__dirname + "/Hufflepuff-house.html");
});

app.get("/ravenclaw", auth, async(req, res) => {
    res.sendFile(__dirname + "/Ravenclaw-house.html");
});

app.get("/slytherin", auth, async(req, res) => {
        res.sendFile(__dirname + "/Slytherin-house.html");
});

app.get("/user/:userName", auth, async (req, res) => {
    const token = req.cookies.userCookie;
    const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
    const userFavs = await Favourite.findOne({userId: verifyUser._id});
    const favList = userFavs.favourites; 
    res.render("favourites", {favList: favList});
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
        res.redirect("/user/" + btnValue);
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
                res.send("<script>alert('Username of e-mail Id does not exist!');window.location = '/login';</script>");
            }
            else{
                const matchPassword = await bcrypt.compare(password, existingUser.password);
                if(!matchPassword){
                    res.send("<script>alert('Wrong Password!');window.location = '/login';</script>");
                }
                else{
                    const token = await jwt.sign({ email: existingUser.email, username: existingUser.username, _id: existingUser._id }, process.env.SECRET_KEY, {
                        expiresIn: '600s'
                    });
                    res.cookie("userCookie", token);
                    res.render("home", { btnValue: existingUser.username });
                }
            }    
        }
        else {
            const name = req.body.personName;
            const email = req.body.email;
            const username = req.body.username;
            const password = req.body.password;

            const foundItem1 = await LoginDetail.findOne({ email: email });
            const foundItem2 = await LoginDetail.findOne({ username: username});
            if (foundItem1 || foundItem2) {
                res.send("<script>alert('Username or e-mail already in use! Try using another!');window.location = '/login';</script>");
            }
            else{
                const hashedPassword = await bcrypt.hash(password, 12);
                const details = await LoginDetail.create({
                    name: name,
                    email: email,
                    username: username,
                    password: hashedPassword
                });
                const token = jwt.sign({ email: details.email, username: details.username, _id: details._id }, process.env.SECRET_KEY,{
                    expiresIn: '1200s'
                });
                res.cookie("userCookie", token);                
                res.render("home", { btnValue: details.username });
            }
        }
    });

app.post("/creatures", auth, function(req,res){
    res.redirect("/creatures");
});

app.post("/creatureQuiz", auth, function(req, res){
    res.sendFile(__dirname + "/quiz.html");
});

app.post("/charQuiz", auth, function(req, res){
    res.sendFile(__dirname + "/quiz2.html");
});

app.post("/storyLineQuiz", auth, function(req, res){
    res.sendFile(__dirname + "/quiz3.html");
});
    
app.post("/search", async function(req, res){
    const creatureName = _.capitalize(req.body.creatureName);
    const foundItems = await Creature.find({name: {$regex : creatureName, $options: 'i'}});
    res.render("creature", {creatureList: foundItems});
    console.log(foundItems);
});

app.post("/favs", auth, async(req, res) => {
    const checkItemId = req.body.checkbox;
    const creature = await Creature.findOne({_id: checkItemId});
    const token = req.cookies.userCookie;
    const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await Favourite.findOne({userId: verifyUser._id});
    if(!user || user === null){
        console.log("entered into if");
        const userFavs = new Favourite({
            userId: verifyUser._id,
            favourites: [{
                creatureName: creature.name,
            }]
        });
        await userFavs.save();
        res.redirect("/creatures");
    }
    else{
        const item = await Favourite.find({userId: verifyUser._id, favourites:{$elemMatch:{creatureName: {$eq: creature.name}}}});
        console.log(item);
        if(item.length == 0 || !item){
            const newItem = {
                creatureName: creature.name
            };
            await user.favourites.push(newItem);
            await user.save();
        }  
        res.redirect("/creatures");
    }
});

app.post("/exitQuiz", auth, function(req, res){
    res.redirect("/");
});

app.listen(port, async () => {
    console.log("server running on " + port);
    // const foundItem = await Creature.find({});
    // if(foundItem.length == 0){
    //     Creature.insertMany(creatures).then(function(err){
    //         if(!err){
    //             console.log("Did not find any creatures, and saved default to DB.");
    //         }
    //         else{
    //             console.log(err);
    //         }
    //     });
    // }
    // console.log(data);
    // console.log("..............");
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