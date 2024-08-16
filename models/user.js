const express = require("express");
const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    name : String,
    email: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
    },
    password: String,
});

const LoginDetail = new mongoose.model("LoginDetail", signupSchema);

module.exports = LoginDetail;