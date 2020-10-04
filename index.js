const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const nodemailer = require('nodemailer');
const ObjectId = require('mongodb').ObjectId;

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

  // get volunteer by id
  app.get('/volunteers/:id', (req, res) => {
    const id = req.params.id;
    const o_id = new ObjectId(id);
    volunteersCollection.find({ _id: o_id }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  //Add all register
  app.post('/addRegister', (req, res) => {
    const registers = req.body;

    registersCollection.insertOne(registers).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //Read data from server - all registers
  app.get('/userRegisterList', (req, res) => {
    registersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get('/userRegisterList/:email', (req, res) => {
    registersCollection
      .find({ email: req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // delete a register by id
  app.delete('/delete/:id', (req, res) => {
    registersCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
});
