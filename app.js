const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const creatures = require("./creatures");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

main().catch(err => console.log(err));
 
async function main() {
  // Use connect method to connect to the server
  await mongoose.connect("mongodb://127.0.0.1:27017/wizardingWorldDB");
}

const signupSchema = new mongoose.Schema({
    name : String,
    email: String,
    username: String,
    password: String,
});
  
const LoginDetail = new mongoose.model("LoginDetail", signupSchema);

const creaturesSchema = new mongoose.Schema({
        name: String,
        description: String,
});

const Creature = new mongoose.model("Creature", creaturesSchema);

const favSchema = new mongoose.Schema({
    name: String,
    favourites:[creaturesSchema],
})

const Favourite = new mongoose.model("Favourite", favSchema);

app.get("/", function(req, res){
    // res.sendFile(__dirname + "/index.html");
    res.render("home", {btnValue: "Login"});
});

app.get("/creatures", function(req, res){
    Creature.find({}).then(function(foundItem){
        if(foundItem.length == 0){
            Creature.insertMany(creatures).then(function(err){
                if(!err){
                        console.log("Done");
                    }
                else{
                    console.log(err);
                }
            });
            res.redirect("/creatures");
        }
        else{
            console.log(foundItem.length);
            res.render("creature", {creatureList: creatures});
        }
    });
});

app.get("/:userName", function(req, res){
    const userName = req.params.userName;
    res.send("hello " + userName);
});

app.post("/login", function(req, res){
    const btnValue = req.body.button;
    if(btnValue == "Login"){
        res.sendFile(__dirname + "/login.html");
    }
    else{
        res.redirect("/" + btnValue);
    }

});

app.post("/", function(req, res){
    const btnValue = req.body.btn;
    
    if(btnValue == "Login"){
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
    }
    else{
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

        LoginDetail.findOne({email: email, username: username}).then(function(foundItem){
            if(!foundItem){
                res.render("home", {btnValue: details.username});
                details.save();
            }
            else{
                res.send("<script>alert('Username or e-mail already in use! Try using another!');window.location = '/';</script>");
            }
        });
    }
});

app.post("/creatures",function(req,res){
    res.redirect("/creatures");
});

app.post("/quiz", function(req, res){
    res.sendFile(__dirname + "/quiz.html");
});

app.post("/xyz", function(req, res){
    const creatureName = _.capitalize(req.body.creatureName);
    Creature.findOne({name: creatureName}).then(function(foundItem){
        res.render("creatureName", {creatureName: creatureName, description: foundItem.description});
    });
});

app.post("/favs", function(req, res){
    const checkItemId = req.body.checkbox;
    const btnValue = req.body.btnValue;
    console.log(btnValue);
    console.log(checkItemId);
    
});

app.post("/exitQuiz", function(req, res){
    const userName = req.body.button;
    console.log(userName);
    // res.redirect("/");
});

app.listen(3000, function(){
    console.log("server running on 3000");
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