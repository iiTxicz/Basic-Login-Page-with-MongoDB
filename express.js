const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Schema, connect, model } = require("mongoose");
const session = require('express-session');

connect('Put-MongoDB-Connection-URI-Here', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB!');
}).catch(error => {
    console.error('MongoDB connection error:', error);
});

// // Change the "login" portion if your schema is different
const loginSchema = new Schema({
    username: { type: String },
    password: { type: String }
});

const login = model('Login', loginSchema);

app.use(bodyParser.urlencoded({ extended: true }));

// Sets up Express session for protected page (Session Token basically)
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Change the "login" portion if your schema is different
        const user = await login.findOne({ username: username });

        if (!user) {
            return res.send('Invalid username or password');
        }

        console.log('Stored MongoDB Password:', user.password);
        console.log('Input Password:', password);;

        if (password === user.password) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/protected');
        } else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/protected', (req, res) => {
    if (req.session.loggedin) {
        res.send('Welcome to the protected page, ' + req.session.username + '!');
    } else {
        res.redirect('/login');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
