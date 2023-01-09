const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const serviceAccount = require("./channels_key.json");

app.use(bodyParser.json());
dotenv.config();

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const port = 3000;

function generateAccessToken(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1800s" });
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.send("Incorrect amount of credentials");
  }

  const userRef = db.collection("users");
  const userSnapshot = await userRef
    .where("username", "==", username)
    .limit(1)
    .get();

  if (!userSnapshot.empty) {
    return res.status(409).json({ error: "User already exists" });
  }

  let passwordHash = await bcrypt.hash(password, 10);

  await userRef.add({ username, password: passwordHash });
  res.status(201).json({ message: "Succesfully created user" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userRef = db.collection("users");
  const userSnapshot = await userRef
    .where("username", "==", username)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    return res.status(404).json({ error: "User does not exist" });
  }

  let currentUser = null;
  userSnapshot.forEach((doc) => (currentUser = doc.data()));

  let hashCompareResult = await bcrypt.compare(password, currentUser.password);

  console.log(hashCompareResult);

  if (hashCompareResult) {
    const token = generateAccessToken(username);
    res.status(200).json({ token, username });
  } else {
    res
      .status(401)
      .json({ message: "Wrong username or password. Please try again." });
  }
});

app.post("/user", async (req, res) => {
  const snapshot = await db.collection("users").get();
  snapshot.forEach((doc) => console.log(doc.id, " => ", doc.data()));
  res.send("Successfully retrieved");
});

app.get("/me", async (req, res) => {
  const userRef = db.collection("users");
  const snapshot = await userRef.where("username", "==", "hein").limit(1).get();
  if (snapshot.empty) {
    console.log("User does not exist");
    res.send("User does not exist");
  }

  let user = null;

  snapshot.forEach((doc) => (user = doc.data()));

  console.log(user);

  res.send("Hello");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
