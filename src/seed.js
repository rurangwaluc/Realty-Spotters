import Neighborhood from './models/Neighborhood.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// <-- Add .js extension here

dotenv.config()

const neighborhoods = [
  {
    name: 'Kimironko',
    city: 'Kigali',
    rentRange: { min: 250000, max: 600000 },
    lifestyleScores: {
      family: 7,
      quiet: 6,
      nightlife: 5,
      commute: 8,
    },
    typicalBedrooms: [1, 2, 3],
    description:
      'Affordable, lively area with markets and good transport access.',
  },

  {
    name: 'Gisozi',
    city: 'Kigali',
    rentRange: { min: 300000, max: 700000 },
    lifestyleScores: {
      family: 8,
      quiet: 7,
      nightlife: 4,
      commute: 7,
    },
    typicalBedrooms: [2, 3],
    description: 'Central residential area, calm with good access to services.',
  },

  {
    name: 'Remera',
    city: 'Kigali',
    rentRange: { min: 350000, max: 900000 },
    lifestyleScores: {
      family: 6,
      quiet: 5,
      nightlife: 8,
      commute: 9,
    },
    typicalBedrooms: [1, 2, 3],
    description:
      'Busy, well-connected area close to offices, stadium, and nightlife.',
  },

  {
    name: 'Nyamirambo',
    city: 'Kigali',
    rentRange: { min: 200000, max: 500000 },
    lifestyleScores: {
      family: 6,
      quiet: 4,
      nightlife: 7,
      commute: 6,
    },
    typicalBedrooms: [1, 2],
    description:
      'Cultural hub with vibrant street life and affordable housing.',
  },

  {
    name: 'Kicukiro',
    city: 'Kigali',
    rentRange: { min: 280000, max: 750000 },
    lifestyleScores: {
      family: 8,
      quiet: 7,
      nightlife: 4,
      commute: 7,
    },
    typicalBedrooms: [2, 3, 4],
    description:
      'Growing residential zone, good for families and long-term living.',
  },
  {
    name: 'Kacyiru',
    rentRange: { min: 600000, max: 1200000 },
    lifestyleScores: {
      quiet: 8,
      family: 9,
      nightlife: 5,
      commute: 9,
    },
    typicalBedrooms: [2, 3, 4],
    description: 'Premium residential area near offices and embassies.',
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    await Neighborhood.deleteMany()
    await Neighborhood.insertMany(neighborhoods)
    console.log('Neighborhoods seeded successfully')
    process.exit()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

seed()
