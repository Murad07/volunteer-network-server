const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
// const { json } = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzt0x.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 5000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect(err => {
    const ordersCollection = client.db("creativeAgency").collection("orders");
    const servicesCollection = client.db("creativeAgency").collection("services");
    const reviewsCollection = client.db("creativeAgency").collection("reviews");
    const adminsCollection = client.db("creativeAgency").collection("admins");


    // Add a new Admin
    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminsCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    // Check is Admin or not
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })
    
    // Add a new Review
    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewsCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    // Show all Reviews
    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    // Add a new Order
    app.post('/addOrder', (req, res) => {
        const name = req.body.name;
        const email = req.body.email;
        const serviceName = req.body.serviceName;
        const description = req.body.description;
        const price = req.body.price;
        const status = req.body.status;
        
        if(req.files){
            const file = req.files.file;
            const newImg = file.data;
            const encImg = newImg.toString('base64');

            var img = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer.from(encImg, 'base64')
            };
        }
        
        ordersCollection.insertOne({ name, email, serviceName, description, price, status, img })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });


    // Show all Orders
    app.get('/allOrders', (req, res) => {
        ordersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // Update Order status
    app.patch('/updateStatus/:id', (req, res) => {
    ordersCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },

        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });


    // Add new Service
    app.post('/addService', (req, res) => {
        const title = req.body.title;
        const description = req.body.description;
        
        if(req.files){
            const file = req.files.file;

            const newImg = file.data;
            const encImg = newImg.toString('base64');

            var img = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer.from(encImg, 'base64')
            };
        }

        servicesCollection.insertOne({ title, description, img })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // Show specifiq user orders
    app.get('/servicesList/:email', (req, res) => {
    ordersCollection
      .find({ email: req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // Show specifiq user orders by service name
    app.get('/orderByName', (req, res) => {
        const title = req.query.title;
        servicesCollection
        .find({ title:  { $regex: title }})
        .toArray((err, documents) => {
            res.send(documents[0]);
        });
  });
    

    // Show all Services
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
});

// check
app.get('/', (req, res) => {
  res.send("hello from db it's working 1");
});

app.listen(process.env.PORT || port);
