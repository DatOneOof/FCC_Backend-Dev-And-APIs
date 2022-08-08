// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/:userInput?", function(req,res){
  let input = req.params.userInput;
  if(input){
    console.log(input);
  let regex = /\d{5,}/;
  let requestedDate;
  if(regex.test(input)){
   requestedDate = new Date(parseInt(input));
  }
  else{
    requestedDate = new Date(input);
  }
     if(requestedDate.toString() != "Invalid Date"){
       res.json({"unix": requestedDate.getTime(), "utc":requestedDate.toUTCString()});
     }
    else{
      res.json({ error : "Invalid Date" });
    }
  
  }
  else{
    res.json({"unix": Date.now(),"utc": new Date(Date.now()).toUTCString()})
  }
});
// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
