const express = require('express');
const gracefulShutdown = require('../index');
const expresshut = gracefulShutdown.Startup();

const PORT = process.env.PORT || 16789;
const app = express();

app.use(expresshut.middleware());

app.get('/', (req, res) => {
  res.writeHead(200);
  res.end('All done');
});

const httpServer = app.listen(PORT, function (err) {
  if (err) {
    console.log("Got error when starting", err);
    process.exit(1);
  }
  console.log("App started port ", PORT)
});

expresshut.setServer(httpServer);