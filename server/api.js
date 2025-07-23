require("dotenv").config(); // Load .env file

const mongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const conString = process.env.MONGO_URI; // ✅ Use environment variable

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ FIXED: Use the correct .env connection string
mongoose.connect(conString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected using Mongoose");
}).catch(err => {
  console.error("❌ Mongoose connection error:", err);
});

// ================== API Routes ===================

app.get('/users/:userid', (req, res) => {
  mongoClient.connect(conString).then(clientObj => {
    const database = clientObj.db("todo");
    database.collection('users').findOne({ user_id: req.params.userid }).then(user => {
      res.send(user);
      res.end();
    });
  });
});

app.get('/appointments/:userid', (req, res) => {
  mongoClient.connect(conString).then(clientObj => {
    const database = clientObj.db("todo");
    database.collection('appointments').find({ user_id: req.params.userid }).toArray().then(docs => {
      res.send(docs);
      res.end();
    });
  });
});

app.get('/appointment/:id', (req, res) => {
  mongoClient.connect(conString).then(clientObj => {
    const database = clientObj.db("todo");
    database.collection('appointments').findOne({ appointment_id: parseInt(req.params.id) }).then(doc => {
      res.send(doc);
      res.end();
    });
  });
});

app.post('/register-user', (req, res) => {
  const user = {
    user_id: req.body.user_id,
    user_name: req.body.user_name,
    password: req.body.password,
    mobile: req.body.mobile
  };

  mongoClient.connect(conString).then(clientObj => {
    const database = clientObj.db("todo");
    database.collection('users').insertOne(user).then(() => {
      console.log('✅ User Registered');
      res.end();
    });
  });
});

app.post('/add-appointment', (req, res) => {
  const appointment = {
    appointment_id: parseInt(req.body.appointment_id),
    title: req.body.title,
    description: req.body.description,
    date: new Date(req.body.date),
    user_id: req.body.user_id
  };

  mongoClient.connect(conString).then(clientObj => {
    const database = clientObj.db("todo");
    database.collection('appointments').insertOne(appointment).then(() => {
      console.log('✅ Appointment Added');
      res.end();
    });
  });
});

app.put('/edit-appointment/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = {
    appointment_id: parseInt(req.body.appointment_id),
    title: req.body.title,
    description: req.body.description,
    date: new Date(req.body.date),
    user_id: req.body.user_id
  };

  mongoClient.connect(conString).then(clientObj => {
    const database = clientObj.db("todo");
    database.collection('appointments').updateOne({ appointment_id: id }, { $set: appointment }).then(() => {
      console.log('✅ Appointment Updated');
      res.end();
    });
  });
});

app.delete('/delete-appointment/:id', (req, res) => {
  const id = parseInt(req.params.id);

  mongoClient.connect(conString).then(clientObj => {
    const database = clientObj.db("todo");
    database.collection('appointments').deleteOne({ appointment_id: id }).then(() => {
      console.log('✅ Appointment Deleted');
      res.end();
    });
  });
});

app.get("/", (req, res) => {
  res.send("✅ API is running");
});

app.listen(4040);
console.log(`🚀 Server started at http://127.0.0.1:4040`);
