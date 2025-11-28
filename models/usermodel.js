const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Add User Name"],
    },
    email: {
        type: String,
        required: [true, "Add User email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Add user password"]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
