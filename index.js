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

const port = 5000;

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

  //Add data from fakedata api
  // ***** When you need to add many data *****
  // ***** just use insertMany at the place of insertOne *****
  app.post('/addVolunteer', (req, res) => {
    const volunteers = req.body;

    volunteersCollection.insertOne(volunteers).then((result) => {
      res.send(result.insertedCount > 0);
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
  app.get('/allVolunteersList', (req, res) => {
    registersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // get single user Volunteer list by email
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

// check
app.get('/', (req, res) => {
  res.send("hello from db it's working");
});

app.listen(process.env.PORT || port);
