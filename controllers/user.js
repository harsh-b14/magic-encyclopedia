const loginOrSignupUser = async(req, res) => {
    const btnValue = req.body.btn;
    if (btnValue == "Login") {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password; 

        const existingUser = await LoginDetail.findOne({ email: email, username: username});
        if(existingUser === null || !existingUser){
            res.send("<script>alert('Username of e-mail Id does not exist!');window.location = '/login';</script>");
        }
        else{
            const matchPassword = await bcrypt.compare(password, existingUser.password);
            if(!matchPassword){
                res.send("<script>alert('Wrong Password!');window.location = '/login';</script>");
            }
            else{
                const token = await jwt.sign({ email: existingUser.email, username: existingUser.username, _id: existingUser._id }, process.env.SECRET_KEY, {
                    expiresIn: '24h'
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
                expiresIn: '24h'
            });
            res.cookie("userCookie", token);                
            res.render("home", { btnValue: details.username });
        }
    }
}

