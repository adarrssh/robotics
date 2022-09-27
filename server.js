
const express = require("express");
const mongoose = require('mongoose');
const User = require('./model')
const jwt = require('jsonwebtoken')
const app = express();

const secret_key = "secretkeyforjwt"
const port = process.env.PORT || 8000
app.use(express.json());

const connectToMongo = () => {
    mongoose.connect("mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/robotics?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => {
        console.log("connected to DB")
    })
}
connectToMongo();

//user schema 



app.post("/signup", async (req, res) => {
    const { FirstName, MiddleName, LastName, email, password, role } = req.body;

    const checkEmail = await User.findOne({ email: email })
    // if email already exists in the database
    if (checkEmail) {
        res.status(400).send("email already exists")
    } else {
        // if role is user/admin/agent
        if (role === "user" || role === "admin" || role === "agent") {
            let token;
            const user = new User({
                FirstName,
                MiddleName,
                LastName,
                email,
                role
            })

            // hashing password
            user.setPassword(password)

            // saving the user in databse
            user.save()
                .then((response) => {


                    token = jwt.sign(
                        { data: response.id },
                        secret_key
                    )
                    console.log(token)
                    res.status(200).json({
                        success: true,
                        token: token
                    })
                }
                )
                .catch((err) => {
                    res.status(400).send(err)
                })
        } else {
            // if value of role is invalid
            res.status(400).send("invalid role")

        }
    }

})

app.post("/login", (req, res) => {
    const { email, password, role } = req.body;
    // if email/password/role is empty
    if (!email || !password || !role) {
        return res.status(422).json({ error: "Please add all fields" })
    }
    // finding the email in the database
    User.findOne({ email: email })
        .then((savedUser) => {
            // if user's email doesn't exists in the database
            if (!savedUser) {
                return res.status(422).json({ error: "invalid email or password" })
            } else {

                if (savedUser.validPassword(password) && savedUser.role === role) {
                    // generating token with the unique id 
                    const token = jwt.sign({ data: savedUser.id }, secret_key);
                    res.status(200).send({ success: true, token: token })
                } else {
                    res.status(400).send("wrong credentails")
                }
            }
        })
        .catch((err) => {
            console.log(err);
        })

})


app.listen(port, () => {
    console.log("started")
})