const OpenAI = require("openai");
const express = require('express');
require('dotenv').config()
const port = process.env.PORT;
const openai = new OpenAI({
    apikey: process.env.OPENAI_API_KEY,
    organization: "org-qXdkGKXlA6I537SSDYIsjT8r",
    project: "proj_DxJuHPYTOOkekVu6d0x88w1T	",
});

const app = express();

async function main() {
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
              "url": "",
            },
          }
        ],
      },
    ],
  });
  console.log(response);
}
main();


app.listen(port, () => {
    console.log(`Server is running on http://My-Ip:${port}`);
  });
  