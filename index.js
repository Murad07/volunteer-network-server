const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const nodemailer = require('nodemailer');

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzt0x.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.listen(5000);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const volunteersCollection = client
    .db('volunteerNetwork')
    .collection('volunteers');

  const registersCollection = client
    .db('volunteerNetwork')
    .collection('registers');

  //Add all data from fakedata api
  app.post('/addVolunteer', (req, res) => {
    const volunteers = req.body;

    volunteersCollection.insertMany(volunteers).then((result) => {
      res.send(result.insertedCount);
    });
  });

  //Read data from server - all volunteers
  app.get('/volunteers', (req, res) => {
    volunteersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //Add all register
  app.post('/addRegister', (req, res) => {
    const registers = req.body;

    registersCollection.insertOne(registers).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
});
