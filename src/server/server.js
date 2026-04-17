const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./UserSchema');
const Location = require('./LocationSchema');

const app = express();
app.use(express.json());
app.use(cors());

const mongoString = "mongodb+srv://418User:418Password@cluster0.kuurxla.mongodb.net/ua_maps?appName=Cluster0";
mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => console.log(error))
database.once('connected', () => console.log('Database Connected'))

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
    role: String
});

const User = mongoose.model('User', userSchema, 'Users');

app.post('/createUser', async (req, res) => {
    console.log(`SERVER: CREATE USER REQ BODY: ${req.body.username} ${req.body.firstName} ${req.body.lastName}`)
    const un = req.body.username
    try {
        User.exists({username: un}).then(result => {
            if(Object.is(result, null)) {
                const user = new User(req.body);
                user.save()
                console.log(`User created! ${user}`)
                res.send(user)
            } else {
                console.log("Username already exists")
                res.status(500).send("Username already exists")
            }
        })
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get('/getUser', async (req, res) => {
    const username = req.query.username
    const password = req.query.password
    
    console.log(username)
    console.log(password)

    try {
        const user = await User.findOne({ username, password })
        if (user) {
            res.send(user)
        } else {
            res.status(401).send("Login failed, try again.")
        }
    } catch (error) {
        res.status(500).send(error)
    }
})


app.post('/createLocation', async (req, res) => {
    console.log(`SERVER: CREATE LOCATION REQ BODY: ${req.body.name} ${req.body.category}`)
    try {
        const location = new Location(req.body);
        await location.save();
        console.log(`Location created! ${location}`)
        res.status(201).send(location);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get('/getLocations', async (req, res) => {
    try {
        const locations = await Location.find();
        res.send(locations);
    } catch (error) {
        res.status(500).send(error);
    }
})


app.listen(9000, () => {
    console.log(`Server Started at ${9000}`)
});








