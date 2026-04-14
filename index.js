require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');
const userRoute = require('./router/user.router');
const taskRoute = require('./router/task.router')

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/users', userRoute);
app.use('/tasks', taskRoute);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
