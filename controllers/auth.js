// To encrypt password
import bcrypt from "bcrypt";

// To create a token for authorization
import jwt from "jsonwebtoken";

// Importing User Model
import User from "../models/User.js";

/* REGISTER USER */

export const register = async (req, resp) => {
    //  Getting all info from req.body
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body;

        // creating a encryption salt and encrypted password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // sending data to database
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 1000)
        })

        // saving data in database
        const savedUser = await newUser.save();
        resp.status(201).json(savedUser);
    } catch (err) {
        resp.status(500).json({ error: err.message })
    }
}

/* LOGGING IN */
export const login = async (req, resp) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return resp.status(400).json({ msg: "User does not exist." })

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return resp.status(400).json({ msg: "Invalid Credentials." })

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET);
        delete user.password;
        resp.status(200).json({token,user})
    } catch (error) {
        resp.json({ error: error.message })
    }
}