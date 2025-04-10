import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstacne = await mongoose.connect(
      "mongodb://127.0.0.1:27017/orbda"
    );
    console.log(
      `\n MongoDB connected! DB host: ${connectionInstacne.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB Connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
