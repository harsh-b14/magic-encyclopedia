const mongoose = require("mongoose");

const creaturesSchema = mongoose.Schema({
    name: {
        type: String, 
        unique: true
    },
    description: String,
});

const Creature = mongoose.model("Creature", creaturesSchema);

module.exports = Creature;