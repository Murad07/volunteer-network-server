const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Thank you for calling me.');
});

app.listen(5000);
