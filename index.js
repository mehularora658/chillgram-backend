import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { verifyToken } from "./middlewares/auth.js";
import { createPost } from "./controllers/posts.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS  to get file [for future use]*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// To use Dotenv things
dotenv.config()

// Instance of Express
const app = express()

//To read request's body and parameters
app.use(express.json());

//To implement helmet middleware which implement's security headers in request to secure application from common web attacks 
app.use(helmet());

//To set crossOriginResourcePolicy header in helmet request header to cross-origin instead of default same-origin to loads resource like (font , images , etc ) from url of any other origin
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

//This function calls the Morgan middleware, responsible for logging HTTP requests and responses in a predefined format for logging, following the Apache Common Log Format (CLF).
app.use(morgan("common"));

// bodyParser.json() is designed to parse incoming request bodies that are in JSON format.
// limit:"30mb": This restricts the maximum size of the parsed JSON request body to 30 megabytes.
// extended: true: This option enables parsing of nested objects and arrays in the JSON data
app.use(bodyParser.json({ limit: "30mb", extended: true }));

// specifically parses incoming request bodies in URL-encoded format. This format is commonly used in HTML forms
// limit:"30mb": This restricts the maximum size of the parsed JSON request body to 30 megabytes.
// extended: true: This option enables parsing of nested objects and arrays in the JSON data
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// For Cross origin user - server communications
app.use(cors())

//To store assets file stored locally in assets folder in public directory
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */

// multer.diskStorage() is a function from the multer middleware package that's used to configure how uploaded  
// files are stored on disk. 
const storage = multer.diskStorage({

    //  destination: function (req, file, cb) { ... } specifies where uploaded files should be saved:
    //  cb(null, "public/assets"): This callback tells Multer to store files in a directory named public/assets 
    //  relative to the project root. */
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },

    //  filename: function (req, file, cb) { ... } determines how filenames are generated for the uploaded files:
    //  cb(null, file.originalname): This callback instructs Multer to use the original filename of the uploaded file 
    //  without any modifications. 
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

// when a file will be uploaded it will use storage variable configurations
const upload = multer({ storage });

/* ROUTES WITH FILES */

app.post("/auth/register", upload.single("picture"), register);
app.post("/post", verifyToken, upload.single("picture"), createPost);

//ROUTES

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */

// Database Connection 

const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => console.log(`SERVER Port : ${PORT}`))

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts)
}).catch((err) => console.log(`${err} did not connect `))