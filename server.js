require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

connectDB();

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

//routes
app.use('/', require('./routes/root'));
app.use('/states', require('./routes/root'));

// Error handling
app.all('*',(req, res) => {
    res.status(404).send("Sorry, Route not found");
});

//make sure connected to MongoDB before listening for events
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
