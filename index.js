const express = require("express");
const app = express();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./channels-3f2a1-firebase-adminsdk-8hxgc-0d28cb5890.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/register", (req, res) => {
  res.send("Registration");
});

app.post("/login", (req, res) => {
  res.send("Login");
});

app.get("/all", async (req, res) => {
  const snapshot = await db.collection("users").get();
  snapshot.forEach((doc) => console.log(doc.id, " => ", doc.data()));
  res.send("Successfully retrieved");
});

app.get("/me", async (req, res) => {
  const userRef = db.collection("users");
  const snapshot = await userRef.where("username", "==", "hein").limit(1).get();

  if (snapshot.empty) {
    console.log("User does not exist");
    return;
  }

  console.log(snapshot[0]);

  // if (!user.exists) {
  // res.send("User does not exist");
  // } else {
  // res.json(user.data());
  // }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
