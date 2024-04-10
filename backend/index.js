const port = 4000;
//const http = require("http");
const express = require("express"); //
const app = express();
const mongoose = require("mongoose"); //databse
const jwt = require("jsonwebtoken"); //generate token and verify it
const multer = require("multer"); //image storage system
const path = require("path"); /*access to backend directory in our expressapp*/
const cors = require("cors"); //provide access to react project
//const server = http.createServer(app);

app.use(
  express.json()
); /*connect to 4000 port,requests are passed using json method*/

app.use(
  cors({
    origin: ["http://localhost:5173", "https://eswaryeluri.netlify.app"],
    credentials: true,
  })
); //access to frontend and connect with backend

// Database Connection with MongoDB
mongoose.connect(
  "mongodb+srv://eswaryeluri13:pawankalyan2@cluster1.yvtc5bo.mongodb.net/ecommerce"
);

app.get("/", (req, res) => {
  res.send("Express App is running");
});

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
});

app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Schema for Creating Products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id: 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
    image: req.body.image,
  });
  console.log(product);
  await product.save(); //as database takes some time to upload , we use this
  console.log("Saved");
  res.json({
    success: true,
    name: req.body.name,
  });
  /*(error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
        });
      }*/
});

// Creating API for deleting Products

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating API for getting all products
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products fetched");
  res.send(products);
});

const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//Creating endpoint for the user

app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "existing user found with same email" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom"); // when we use this salt , our data will be encrypted by one layer
  res.json({ success: true, token });

  /*Secret:

In the context of cryptographic practices, a "secret" is typically a key, passphrase, or any piece of information kept confidential to ensure the security of cryptographic operations. 
In the provided code snippet, 'secret_ecom' is used as a secret key to sign the JSON Web Token (JWT).

Salt:

A "salt" is a random value that is used as an additional input to a one-way function (like a hash function) during the process of hashing passwords.
 The purpose of a salt is to prevent attackers from using precomputed tables (rainbow tables) to efficiently crack passwords.
 Salting is commonly used in password storage to enhance security.*/
});

//creating endpoint fro user login
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email ID" });
  }
});

// creating endpoint for newcollection data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("NewCollection Fetched");
  res.send(newcollection);
});

app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popular_in_women = products.slice(0, 4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
});

// creating middleware to fetch user

const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using valid token" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      req.status(401).send({ errors: "Please authenticate using valid token" });
    }
  }
};

//creating endpoint for popular in women section
app.post("/addtocart", fetchUser, async (req, res) => {
  console.log("Added", req.body.itemID);
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemID] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
  console.log(req.body, req.user);
});

app.post("/removefromcart", fetchUser, async (req, res) => {
  console.log("removed", req.body.itemID);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemID] > 0)
    userData.cartData[req.body.itemID] -= 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});

//creating endpoint to get cartdata
app.post("/getcart", fetchUser, async (req, res) => {
  console.log("GetCart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error : " + error);
  }
});
