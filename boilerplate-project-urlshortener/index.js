require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require('dns');
const urlParser = require("url")

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let Schema = mongoose.Schema;

let urlSchema = new Schema({
  original_url: { type: String }
});

let urlModel = mongoose.model("ShortenedURL", urlSchema);



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl", (req, res) => {
  let urlInput = req.body.url;
  let httpUrl = /^http:\/\//
  let httpsUrl = /^https:\/\//
  const options = {
    all: true,
  };
  console.log("url:", urlInput);
  if (httpsUrl.test(urlInput) || httpUrl.test(urlInput)) {
    dns.lookup(urlParser.parse(urlInput).hostname, options, (err, adresses) => {
      if (err) { console.log(err); res.json({ error: "invalid url" }) }
      else {
        urlModel.find({ original_url: urlInput })
          .then(function(urlSearch) {

            if (urlSearch.length == 0) {
              let currUrl = new urlModel({ original_url: urlInput });
              currUrl.save(function(err, data) {

                res.json({ original_url: data.original_url, short_url: data._id.toString() });
              });

            }
            else {
              console.log("response: ", urlSearch[0]["_id"]);
              res.json({ original_url: urlSearch[0]["original_url"], short_url: urlSearch[0]["_id"].toString });


            }
          })

      }
    })
  }
  else {
    res.json({ error: "invalid url" });
  }

})



app.get('/api/shorturl/:id', function(req, res) {
  let shortId = req.params.id;
   urlModel.findOne({_id:shortId})
     .then(function(urlSearch){
   if(urlSearch.length == 0){
        res.json({error: "Couldn't find registered url"});
   }
   else{
     res.redirect(urlSearch["original_url"]);
   
   }})
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

