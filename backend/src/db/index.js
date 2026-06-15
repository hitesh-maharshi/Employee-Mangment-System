import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS to Google Public DNS to fix querySrv ECONNREFUSED on some networks
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'Employe_Managment_Sysetm';

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }

    console.log(`Attempting to connect to MongoDB...`);
    const connectionInstance = await mongoose.connect(`${uri}/${dbName}`);

    console.log(`\nMongoDB Connected Successfully!`);
    console.log(`DB Host: ${connectionInstance.connection.host}`);
    console.log(`DB Name: ${connectionInstance.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error: ", error.message);
    process.exit(1);
  }
};

export default connectDB;
