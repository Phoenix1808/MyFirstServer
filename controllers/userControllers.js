const User = require("../models/usermodel");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// REGISTER
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("User already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword
    });

    res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    });
});

// LOGIN
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            },
            process.env.ACCESS_TOKEN,
            { expiresIn: "15m" }
        );

        res.status(200).json({ accessToken: token });
    } else {
        res.status(401);
        throw new Error("Email or password invalid");
    }
});

// CURRENT USER
const currentInfo = asyncHandler(async (req, res) => {
    res.json(req.user);
});

module.exports = { registerUser, loginUser, currentInfo };
