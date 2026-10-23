// createAdmin.ts — run once (npm run seed:admin) to create the login users.
// Creates an admin (can manage analysts) and a regular analyst.
// Change the passwords after first login in any real deployment.
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Analyst from "./models/Analyst";

const USERS = [
  {
    name: "SOC Admin",
    email: process.env.ADMIN_EMAIL || "admin@soc.local",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    location: "Security Operations",
    role: "admin",
  },
  {
    name: "John Analyst",
    email: "analyst1@soc.local",
    password: "Analyst@123",
    location: "Security Operations",
    role: "analyst",
  },
];

const run = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    for (const u of USERS) {
      const existing = await Analyst.findOne({ email: u.email });
      if (existing) {
        console.log(`⚠️ ${u.email} already exists, skipping.`);
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 10);
      await Analyst.create({ ...u, password: hashed });
      console.log(`🎉 Created ${u.role}: ${u.email} / ${u.password}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating users:", err);
    process.exit(1);
  }
};

run();
