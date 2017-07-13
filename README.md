# Gracefully Shut Down Express.js with ES6

This module is a easy way to setup graceful shutdown of your application running with Kubernetes.
It will help you to notify the loadbalancer with 503 and avoid having customer request failing because we stop our application.


Scenarios for a graceful shutdown:
```
    App gets notification to stop (received SIGTERM)
    App lets know the load balancer that it’s not ready for newer requests responding with 503 for every new request
    App served all the ongoing requests
    App releases all of the resources in use.
    App tries to exits with "success" status code (process.exit())
    If exit gracefuly fails, app exits with process.exit(1) reporting the failure.
```

# How does it work?
This module was designed to work together with Kubernetes. 
The graceful shutdown need to notify the Service’s load balancer during the shutdown that we wont be serving more requests, and reply back with 503. 
We then close the server, tear down the all connections and exit gracefully.

See the below UML diagram for a complete architecture view:
![UML](https://github.com/thomasmodeneis/graceful-shutdown-express-app/raw/master/graceful-shutdown-uml.jpg)

Implementation example:

```
const express = require('express');
const gracefulShutdown = require('../src/index');
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
```


## Author
* Thomas Modeneis
* [StackOverflow](https://careers.stackoverflow.com/thomasmodeneis)
* [LinkedIn](https://uk.linkedin.com/in/thomasmodeneis)

License
=======

This module is licensed under the MIT license.