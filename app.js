require("dotenv").config()

const express = require("express")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.set("view engine", "ejs")

/////////////// Database setup ///////////////

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once("open", () => { console.log("Connected to MongoDB") } )
mongoose.connection.on("error", (error) => { console.log(error) })

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
})
const options = {
    secret: process.env.SECRET,
    encryptedFields: ['password']
}
userSchema.plugin(encrypt, options)

const User = mongoose.model("User", userSchema)


/////////////// Routes ///////////////
 
// Home
app.get("/", (req, res) => {
    res.render("home.ejs")
})

// Render login page
app.get("/login", (req, res) => {
    res.render("login.ejs")
})

// Render register page
app.get("/register", (req, res) => {
    res.render("register.ejs")
})

// Handle registration
app.post("/register", async (req, res) => {

    try {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        })
        await newUser.save()
        res.render("secrets.ejs")
    }
    catch(error) {
        console.log(error)
    }
})

// Handle login
app.post("/login", async (req, res) => {

    const username = req.body.username
    const password = req.body.password

    try {
        const foundUser = await User.findOne({ email: username })
        if (foundUser) {

            if (foundUser.password === password) {
                res.render("secrets.ejs")
            } else {
                console.log("Incorrect password")
            }

        } else {
            console.log("Username not found")
        }
    }
    catch(error) {
        console.log(error)
    }
})



app.listen(process.env.PORT || 3000, () => {
    console.log("Server listening on port 3000.")
})
