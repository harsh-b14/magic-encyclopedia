const creatureProfileSchema = new mongoose.Schema({
    name: String,
    details: [
        String
    ],
});

const CreatureProfile = new mongoose.model("CreatureProfile", creatureProfileSchema);

module.exports = CreatureProfile;