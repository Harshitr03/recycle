const OpenAI = require("openai");
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const User = require('./models/users');

mongoose.connect('mongodb://127.0.0.1:27017/recycle-app')
  .then(() => {
    console.log("MONGO CONNECTION SECURED");
  })
  .catch(err => {
    console.log(err);
  })

const googleapi = process.env.GOOGLE_MAPS_API_KEY;
const port = process.env.PORT || 8080;
const openai = new OpenAI({
  apikey: process.env.OPENAI_API_KEY,
  organization: "org-qXdkGKXlA6I537SSDYIsjT8r",
  project: "proj_DxJuHPYTOOkekVu6d0x88w1T"
});
const app = express();

app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));


app.post('/', async (req, res) => {
  const { image } = req.body;
  if (image) {
    async function openimage(url) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What's in this image?" },
              {
                type: "image_url",
                image_url: {
                  "url": `${url}`,
                  "detail": "high"
                },
              }
            ],
          },
        ],
      });
      res.send(response.choices[0].message);
    }
    openimage(image);

  } else {
    res.status(400).json({ error: 'No image provided' });
  }
});

app.get('/Map', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const location = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleapi}`);
  const resloc = await location.json();
  var loc;
  for (let i = 0; i < resloc.results[0].address_components.length; i++) {
    if (resloc.results[0].address_components[i].types[1] == 'administrative_area_level_3') {
      loc = resloc.results[0].address_components[i].long_name;
    }
  }
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=recycling%20centers%20in%20${loc}&key=${googleapi}`);
    const data = await response.json();
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching from Google API:", error);
    res.status(500).json({ error: 'Error fetching Google API data' });
  }
});

app.post('/register', async (req, res, next) => {
  try {
    const { username, password, emailid } = req.body;
    console.log(req.body);
    // Create a new user object (without the password)
    const user = new User({ username, emailid });

    // Register the user with passport-local-mongoose (automatically hashes the password)
    const registeredUser = await User.register(user, password);

    // Automatically log in the user after successful registration
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err); // Pass the error to the error handler
      }
      console.log("GOOD")
      // Send a success response back to the frontend
      res.status(200).json({ message: 'Registration successful', username });
    });
  } catch (e) {
    console.log("WORST")
    // Handle registration errors (like duplicate users, validation errors, etc.)
    res.status(400).json({ error: e.message });
  }
});


app.post('/login', passport.authenticate('local', { failureRedirect: '/patient/login' }), (req, res) => {
  // res.redirect(/patient/${req.user._id});
})

app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // res.redirect('/campgrounds');
  });
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
