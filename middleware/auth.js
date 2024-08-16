const auth = async(req, res, next) => {
    try {
        const { userCookie } = req.cookies;
        if (!userCookie || userCookie === '') {
            res.redirect("/login");
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
        res.redirect("/login");
    }
}

module.exports = auth;