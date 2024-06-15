const express = require('express');
// Import and require Pool
const { Pool } = require('pg');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const pool = new Pool(
  {
    user: 'postgres',
    password: '',
    host: 'localhost',
    database: 'movies_db'
  },
  console.log(`Connected to the movies_db database.`)
)

pool.connect();




// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  