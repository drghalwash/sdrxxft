import mongoose from 'mongoose';

// Set the MongoDB connection URL with a fallback value
const MONGO_CONNECTION_URL =
  process.env.MONGO_CONNECTION_URL ||
  'mongodb+srv://mobarikkarim2002:gEFfqqGCclBO8Z2q@doctor-khaled.5psi6.mongodb.net/Doctor-Khaled?retryWrites=true&w=majority&appName=Doctor-Khaled';

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    // Validate the MongoDB URL format before attempting to connect
    if (!MONGO_CONNECTION_URL.startsWith('mongodb://') && !MONGO_CONNECTION_URL.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB connection URL format. Must start with "mongodb://" or "mongodb+srv://".');
    }

    // Attempt to connect to MongoDB
    await mongoose.connect(MONGO_CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 60000, // 60 seconds timeout for initial connection
      socketTimeoutMS: 120000, // 120 seconds timeout for socket operations
      bufferCommands: true,    // Allow buffering of commands until connection is established
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);

    // Handle specific error cases
    if (error.name === 'MongoParseError') {
      console.error('MongoDB connection string is malformed. Please check the format.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error while trying to connect to MongoDB. Ensure the database server is reachable.');
    } else if (error.message.includes('Invalid MongoDB connection URL format')) {
      console.error(error.message);
    } else {
      console.error('An unknown error occurred while connecting to MongoDB.');
    }

    // Render a custom error page for database connection failure
    app.use((req, res) => {
      res.status(500).render('Dashboard/404', { error });
    });
  }
}

// Connect to MongoDB and start the server
connectToDatabase().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start the application:', error);

  // Render a fallback error page if the app fails to start
  app.use((req, res) => {
    res.status(500).render('Dashboard/404', { error });
  });
});


import HomeDB from "../DB Models/Home.js"
import OffersDB from "../DB Models/Offers.js"
import Photo_Gallaries from "../DB Models/Photo_Gallary.js"

export const index = async (req, res) => {
    try{
        //  await OffersDB.create({
        //     video_link: "https://www.youtube.com/embed/vB2pdb-I2EY?si=EPgiUseqjMCU0uTD",
        //     title: "Far far away, behind the word mountains",
        //     description: "Vokalia and Consonantia, there live the blind texts. Separated they live.",
        // }); 
        const  Get_Home= await HomeDB.find({}).lean();
        const  Offers= await OffersDB.find({}).lean();
        const Home = Get_Home[0]
        const  Photo_Gallary= await Photo_Gallaries.find({}).lean();
    res.render('Pages/index',{Home,Offers,Photo_Gallary})
} catch (error) {
    console.error(error);
    res.status(500).render("Pages/404", { error });
}
};
