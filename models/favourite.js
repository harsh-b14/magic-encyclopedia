const mongoose = require("mongoose");

const favSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'LoginDetail', 
        unique: true
    },
    favourites:[
        {
            creatureName: String,
        },
    ],
});

const Favourite = new mongoose.model("Favourite", favSchema);

module.exports = Favourite;