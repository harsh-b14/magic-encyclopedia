const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
        if(foundItem != null){
            res.render("home", {btnValue: details.username});
            details.save();
        }
        else{
            res.send("<script>alert('Username or e-mail already in use! Try using another!');window.location = '/';</script>");
        }
    });  
});

app.post("/login", function(req, res){
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    LoginDetail.findOne({email: email, username: username, password: password}).then(function(foundItem){
        if(foundItem === null){
            res.send("<script>alert('You may have entered wrong credentials! Please check it and try again..');window.location = '/';</script>");
        }
        else{
            res.render("home", {btnValue: foundItem.username});
        }
    });
});

app.listen(3000, function(){
    console.log("server running on 3000");
});