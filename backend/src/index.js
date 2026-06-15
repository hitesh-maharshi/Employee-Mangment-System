import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

// Configure dotenv to load environment variables as early as possible
dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT || 8000;

// Connect to MongoDB Database
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚙️  Server is running at port : ${PORT}`);
    });

    app.on("error", (error) => {
      console.error("Express Server Error: ", error);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed !!! ", err);
  });
