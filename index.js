const express = require('express');
const connectDB = require('./config/db');

const startServer = async () => {
  const app = express();

  await connectDB();

  const PORT = process.env.PORT || 5005;
  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
};

startServer();
