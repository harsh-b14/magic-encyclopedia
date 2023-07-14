const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
// app.set('view engine', 'ejs');
app.use(express.static("public"));

main().catch(err => console.log(err));
 
async function main() {
  // Use connect method to connect to the server
  await mongoose.connect("mongodb://127.0.0.1:27017/userCredentialsDetailsDB");
}

const signupSchema = new mongoose.Schema({
    name : String,
    email: String,
    password: String,
  });
  
const loginDetails = new mongoose.model("loginDetails", signupSchema);

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res){
    res.sendFile(__dirname + "/login.html");
});

app.post("/signup", function(req, res){
    const name = req.body.personName;
    const email = req.body.email;
    const password = req.body.password;

    const details = new loginDetails({
        name: name,
        email: email,
        password: password
      });

    details.save();
});

app.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    loginDetails.findOne({email: email, password: password}).then(function(err){
        if(!err){
            res.redirect("/");
        }
        else{
            console.log(err);
        }
    });
});

app.listen(3000, function(){
    console.log("server running on 3000");
});