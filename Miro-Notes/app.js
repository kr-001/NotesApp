
const express = require('express');
const {MongoClient} = require('mongodb');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(morgan('dev'));
app.use(express.json());

//rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 *1000 , //15 minutes
    max: 100, //100 req per IP
});

app.use('/api/' , limiter);

//DB CONNECTION
const url = "mongodb://localhost:27017";
const dbName = 'miroNotes';

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected To Database");
    const db = client.db(dbName);
    app.locals.db = db;
    await db.collection('notes').createIndex({ title: "text" });
  } catch (err) {
    console.error("ERROR CONNECTING DB:", err);
    process.exit(1);
  }
};



connectDB().then(() => {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/notes', require('./routes/noteRoutes'));

  app.listen(PORT , ()=>{
    console.log(`Server is listening on http://localhost:${PORT}`);
  });
});