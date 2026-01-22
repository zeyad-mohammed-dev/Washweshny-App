import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    const result = await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(result.models);
    console.log(colors.bgBrightGreen('Connected to MongoDB successfully 💖'));
  } catch (error) {
    console.error(colors.bgRed('🚫 Database connection error:'), error);
  }
};
export default connectDB;
