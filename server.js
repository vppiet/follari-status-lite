const express = require('express');

const app = express();
const port = 5050;


app.get('/', (req, res) => {
  console.log('Request arrived. Headers:');
  console.log(req.headers);
  res.send(`<h1>Föllari status lite</h1>\n<p>${timestamp}</p>`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Example of we can request Föli's API every minute
// using Node.js' event loop. We could extend EventEmitter
// and implement it as a proper event when we have new data.
let timestamp = '';

const setTimestamp = () => {
  timestamp = Math.round(Date.now() / 1000);
};

setInterval(setTimestamp, 1000);
