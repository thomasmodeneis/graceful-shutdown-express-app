# Gracefully Shut Down Express.js with ES6

This module is a easy way to setup graceful shutdown of your application.
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

See example folder for implementation example.