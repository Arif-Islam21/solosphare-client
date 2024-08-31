const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(
  cors({
    origin: ["https://solosphere-f4c02.web.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// soloSphere
// RDZz9P33zW6hOWJI

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n7e36sw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobCollection = client.db("soloSphere").collection("job");
    const bidCollection = client.db("soloSphere").collection("bid");

    // authentication related items
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.get("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ "cookie removed": true });
    });

    // get data from the db and use it
    app.get("/job", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.post("/job", async (req, res) => {
      const jobData = req.body;
      const result = await jobCollection.insertOne(jobData);
      res.send(result);
    });

    app.put("/job/:id", async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJob = {
        $set: {
          ...jobData,
        },
      };
      const result = await jobCollection.updateOne(query, updatedJob, options);
      res.send(result);
    });

    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // jobs
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    // working with bid data
    app.get("/bid", async (req, res) => {
      const result = await bidCollection.find().toArray();
      res.send(result);
    });

    app.post("/bid", async (req, res) => {
      const data = req.body;
      const result = await bidCollection.insertOne(data);
      res.send(result);
    });
    // update bid status
    app.patch("/bid/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: status,
      };
      const result = await bidCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.get("/bid/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bidCollection.find(query).toArray();
      res.send(result);
    });

    // get all the bid requests
    app.get("/bidRequests/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await bidCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("app is running");
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
