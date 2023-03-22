const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserTime = require('./models/userTime');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://bobbymmccarthy:dYt91o6VXnG6BiMf@sveltescheduler.qvbtdrw.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('Connected to DB'))
    .catch(console.error)

// routing and async await
app.get('/userTimes', async (req, res) => {
    const userTimes = await UserTime.find();
    console.log(userTimes)
    res.json(userTimes)
})

// routing
app.post('/userTimes', (req,res) => {

    const userTime = new UserTime({
        name: req.body.name,
        times: req.body.times
    });

    userTime.save();
    res.json(userTime);
})


app.listen(3001, () => {
    console.log('Server listening on port 3001...')
})