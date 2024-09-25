const OpenAI = require("openai");
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const googleapi = process.env.GOOGLE_MAPS_API_KEY;
const port = process.env.PORT || 8080;
const openai = new OpenAI({
  apikey: process.env.OPENAI_API_KEY,
  organization: "org-qXdkGKXlA6I537SSDYIsjT8r",
  project: "proj_DxJuHPYTOOkekVu6d0x88w1T"
});

const app = express();
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
        console.log(response.choices[0].message);
        res.send(response.choices[0].message);
      }
    openimage(image);
     
  } else {
    res.status(400).json({ error: 'No image provided' });
  }
});

app.get('/Map', async (req, res) => {
    const lat=req.query.lat;
    const lon=req.query.lon;
    const location=  await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleapi}`);
    const resloc = await location.json();
    var loc;
    for(let i=0;i<resloc.results[0].address_components.length;i++){
        if(resloc.results[0].address_components[i].types[1]=='administrative_area_level_3'){
            loc=resloc.results[0].address_components[i].long_name;
        }
    }
    console.log(loc)
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=recycling%20centers%20in%20${loc}&key=${googleapi}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching from Google API:", error);
    res.status(500).json({ error: 'Error fetching Google API data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
