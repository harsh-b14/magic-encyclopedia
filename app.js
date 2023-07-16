const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const popupS = require("popups");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

main().catch(err => console.log(err));
 
async function main() {
  // Use connect method to connect to the server
  await mongoose.connect("mongodb://127.0.0.1:27017/userCredentialsDetailsDB");
}

const signupSchema = new mongoose.Schema({
    name : String,
    email: String,
    username: String,
    password: String,
  });
  
const LoginDetail = new mongoose.model("LoginDetail", signupSchema);

app.get("/", function(req, res){
    // res.sendFile(__dirname + "/index.html");
    res.render("home", {btnValue: "Login"});
});

// app.get("/signup", function(req, res){
//     res.sendFile(__dirname + "/login.html");
// });

app.post("/", function(req, res){   
    res.sendFile(__dirname + "/login.html");
});

app.post("/signup", function(req, res){
    const name = req.body.personName;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const details = new LoginDetail({
        name: name,
        email: email,
        username: username,
        password: password
      });

    LoginDetail.find({email: email, username: username}).then(function(foundItem){
        if(!foundItem){
            res.render("home", {btnValue: details.username});
        }
        else{
            res.send("<script>alert('Username or e-mail already in use!<br>Try using another!');window.location = '/';</script>");
        }
    });
    // LoginDetail.find({username: username}).then(function(foundItem){
    //     if(!foundItem){
    //         res.render("home", {btnValue: details.username});
    //     }
    //     else{
    //         res.send("<script>alert('message');window.location = '/';</script>");
    //     }
    // });

    details.save();

    // res.render("home", {btnValue: details.username});
});

app.post("/login", function(req, res){
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
<<<<<<< HEAD
    loginDetails.findOne({email: email, password: password}).then(function(err){
        if(!err){
            // document.querySelector("button").innerHTML = "qwe";
            res.redirect("/");
=======
    LoginDetail.findOne({email: email, username: username, password: password}).then(function(foundItem){
        if(foundItem === null){
<<<<<<< HEAD
            res.send("<script>alert('Somthing went wring'); window.location.href ='./login.html' </script>");
>>>>>>> 9fae508efdcf1294bc2750395226e1409705ab78
=======
            res.send("<script>alert('You may have entered wrong credentials!<br>Please check it try again..');window.location = '/';</script>");
>>>>>>> d7d0c4bd277ccad051f355566265168069165815
        }
        else{
            res.render("home", {btnValue: foundItem.username});
        }
    });
});

app.listen(3000, function(){
    console.log("server running on 3000");
});