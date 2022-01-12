const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// db connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.weui7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("MathDataSci");
    const usersCollection = database.collection("users");
    const enrollCollection = database.collection("enroll");

    // save enroll
    app.post("/enroll", async (req, res) => {
      const order = req.body;
      const result = await enrollCollection.insertOne(order);
      res.json(result);
    });
    // find enroll by user email
    app.get("/enroll/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await enrollCollection.find(query).toArray();
      res.json(result);
    });
    // find all enroll
    app.get("/enroll", async (req, res) => {
      const result = await enrollCollection.find({}).toArray();
      res.json(result);
    });
    // update enroll status
    app.put("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const paymentStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          paymentStatus: paymentStatus.paymentStatus,
        },
      };
      const result = await enrollCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    // delete enroll
    app.delete("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await enrollCollection.deleteOne(query);
      res.json(result);
    });
    // save user to db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // save or update google login user to db
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    // save or update user role as admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.adminEmail };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // find user if admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello! I Am online course Server");
});
app.listen(port, () => {
  console.log("Listening form port :", port);
});
