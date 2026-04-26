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



app.post('/createLocation', async (req, res) => {
    console.log("CREATE LOCATION BODY:", req.body);

    try {
        const finalLat = Number(req.body.coordinates.lat);
        const finalLong = Number(req.body.coordinates.long);

        const existingLocation = await Location.findOne({
            "coordinates.lat": finalLat,
            "coordinates.long": finalLong
        });

        if (existingLocation) {
            return res.status(400).send("A location with these coordinates already exists.");
        }

        const user = await User.findOne({ username: req.body.createdBy });

        const status = user && user.role === "admin" ? "approved" : "pending";

        const location = new Location({
            name: req.body.name,
            category: req.body.category,
            description: req.body.description,
            createdBy: req.body.createdBy,
            coordinates: {
                lat: finalLat,
                long: finalLong
            },
            status: status
        });

        await location.save();

        console.log("Location created:", location);
        res.status(201).send(location);

    } catch (error) {
        console.log("CREATE LOCATION ERROR:", error);
        res.status(500).send(error.message);
    }
});
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


app.get('/getLocationsByCategory', async (req, res) => {
    const category = req.query.category;

    try {
        const locations = await Location.find({
            category: category,
            status: "approved"
        });

        res.send(locations);

    } catch (error) {
        console.log("GET LOCATIONS BY CATEGORY ERROR:", error);
        res.status(500).send(error.message);
    }
});

app.get('/getPendingLocations', async (req, res) => {
    try {
        const pendingLocations = await Location.find({
            status: "pending"
        });
        console.log(pendingLocations);

        res.send(pendingLocations);

    } catch (error) {
        console.log("GET PENDING LOCATIONS ERROR:", error);
        res.status(500).send(error.message);
    }
});

app.patch('/updateLocationStatus/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Optional: validate status
        if (!["pending", "approved", "declined"].includes(status)) {
            return res.status(400).send("Invalid status");
        }

        const updatedLocation = await Location.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedLocation) {
            return res.status(404).send("Location not found");
        }

        res.send(updatedLocation);

    } catch (error) {
        console.log("UPDATE LOCATION STATUS ERROR:", error);
        res.status(500).send(error.message);
    }
});



app.get('/getLocations', async (req, res) => {
    try {
        const locations = await Location.find({ status: "approved" });
        res.send(locations);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.listen(9000, () => {
    console.log(`Server Started at ${9000}`)
});








