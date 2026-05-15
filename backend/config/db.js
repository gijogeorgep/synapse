import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("CRITICAL: MongoDB Connection Error!");
    console.error(`Message: ${error.message}`);
    console.error("Tip: Check if your IP is whitelisted in MongoDB Atlas and if MONGO_URI is correct.");
    process.exit(1);
  }
};

export default connectDB;
