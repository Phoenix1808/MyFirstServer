const express = require("express");
const validateToken = require("../middleware/validateTokenHandler")
const {registerUser , loginUser, currentInfo} = require("../controllers/userControllers")

const router = express.Router();

router.post("/register" , registerUser);

router.post("/login", loginUser);

router.get("/current",validateToken, currentInfo)

module.exports = router;