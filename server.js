const express = require('express');

const app = express();
const port = 5050;

app.get('/', (req, res) => {
  console.log('Request arrived. Headers:');
  console.log(req.headers);
  res.send('Föllari status lite');
});

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
