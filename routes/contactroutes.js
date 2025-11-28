const express = require('express');
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");

const {
    getConta,
    createConta,
    UpdateConta,
    deleteConta,
    getContact
} = require("../controllers/contactControllers");

router.use(validateToken);  // protect all contact routes

router.route("/")
    .get(getConta)
    .post(createConta);

router.route("/:id")
    .get(getContact)
    .put(UpdateConta)
    .delete(deleteConta);

module.exports = router;
