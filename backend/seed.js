// backend/seed.js — wipes restaurants, seeds 6 Aussie restaurants + test admin and diner.
// Compatible with the nahaQUT sampleapp_IFQ636 starter (uses MONGO_URI + bcrypt + pre-save hook).

require('dotenv').config();
const mongoose = require('mongoose');

const Restaurant = require('./models/Restaurant');
const User = require('./models/User');

const RESTAURANTS = [
  { name: 'Saigon & Smoke',  slug: 'saigon-smoke',   cuisine: 'Vietnamese BBQ',   location: 'Sydney, NSW',     description: 'Modern Vietnamese with a wood-fire focus. Lemongrass beef short rib with nuoc cham.', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Nori & Nora',     slug: 'nori-nora',      cuisine: 'Japanese Italian', location: 'Melbourne, VIC',  description: 'Tokyo izakaya meets Sicilian pasta. Tasting menu Fri/Sat only.',                  imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Ember & Oak',     slug: 'ember-oak',      cuisine: 'Korean Australian',location: 'Brisbane, QLD',   description: 'Riverside grill. Wagyu over white oak coals, banchan rotated weekly.',          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Masala & Mezze',  slug: 'masala-mezze',   cuisine: 'Indian Levantine', location: 'Perth, WA',       description: 'Northbridge fusion plates. Tandoor lamb with tahini, dosa with hummus.',         imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Lotus Cantina',   slug: 'lotus-cantina',  cuisine: 'Modern Cantonese', location: 'Adelaide, SA',    description: 'Tea-smoked duck, daily yum cha, ten-course banquet on weekends.',                imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Canberra Crust',  slug: 'canberra-crust', cuisine: 'Wood-fired Pizza', location: 'Canberra, ACT',   description: 'Braddon wood-fire pizzeria. 48hr ferment, native pepperberry hot honey.',         imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80' },
];

async function ensureUser(email, name, password, role) {
  let user = await User.findOne({ email });
  if (user) {
    user.name = name;
    user.role = role;
    user.password = password;       // triggers pre-save bcrypt hash hook
    await user.save();
    console.log(`Updated user: ${email} (${role})`);
  } else {
    user = await User.create({ name, email, password, role });
    console.log(`Created user: ${email} (${role})`);
  }
  return user;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Restaurant.deleteMany({});
  await Restaurant.insertMany(RESTAURANTS);
  console.log(`Seeded ${RESTAURANTS.length} restaurants`);

  await ensureUser('admin@mesa.test', 'Mesa Admin', 'admin1234', 'admin');
  await ensureUser('diner@mesa.test', 'Test Diner', 'diner1234', 'diner');

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});