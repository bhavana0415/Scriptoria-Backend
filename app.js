const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const favouritesRoutes = require('./routes/favourites-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();
app.use(bodyParser.json());

app.use('/api/favourites', favouritesRoutes); 
app.use('/api/users', usersRoutes); 

app.use('/',(req, res, next) => {
  res.send('<h1>Hi there!!</h1>');
})

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'});
});

mongoose.connect('mongodb+srv://bhavanamanaswini:uLKdPwJiSAaDPbpZ@cluster0.vuncyia.mongodb.net/scriptoria?retryWrites=true&w=majority').then(()=>{
  app.listen(5000);
}).catch(err=>{
  console.log("error connecting to mongo");
});