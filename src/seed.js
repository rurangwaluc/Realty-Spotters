require("dotenv").config();
const mongoose = require("mongoose");
const Neighborhood = require("./models/Neighborhood");

const neighborhoods = [
  {
    name: "Kimironko",
    rentRange: { min: 300000, max: 700000 },
    lifestyleScores: {
      quiet: 6,
      family: 7,
      nightlife: 6,
      commute: 8,
    },
    typicalBedrooms: [1, 2, 3],
    description: "Affordable, well-connected, popular with families and professionals.",
  },
  {
    name: "Kacyiru",
    rentRange: { min: 600000, max: 1200000 },
    lifestyleScores: {
      quiet: 8,
      family: 9,
      nightlife: 5,
      commute: 9,
    },
    typicalBedrooms: [2, 3, 4],
    description: "Premium residential area near offices and embassies.",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Neighborhood.deleteMany();
    await Neighborhood.insertMany(neighborhoods);
    console.log("Neighborhoods seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
