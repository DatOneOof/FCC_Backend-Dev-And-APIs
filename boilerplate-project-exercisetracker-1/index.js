const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))

let exerciseSchema = new Schema({ description: String, duration:Number, date: Date }, { _id: false });

let userSchema = new Schema({
  username: String,
  log:[exerciseSchema]
}, { minimize: false })

let userModel = mongoose.model("Users", userSchema);

//
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.post("/api/users",(req,res) => {
  let username = req.body.username;
  let currUser = new userModel({username: username});
  currUser.save(function(err,data){
    if(err){console.log(err)}
    res.json({username: data["username"], _id: data["_id"]});
  })
})
app.get("/api/users",(req,res) => {
  userModel.find().then((array) => res.send(array));
})
app.post("/api/users/:_id/exercises",(req,res) => {
   let userId = req.params._id;
   let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
 // console.log("dateString: ", date)
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  if(date){
    date = new Date(date);
  }
  else{
    date = new Date();
  }
 // date = date.toLocaleDateString('en-us', options).replace(/,/g, "");
  //console.log("date: ", date)
  userModel.findOneAndUpdate({_id: userId}, {"$push":{"log": {
    description: description,
    duration: parseFloat(duration),
    date: date,
  }}},{ new: true }, function(err, data) {
   
    res.json({
   username: data["username"], 
  description: description,
  duration: parseFloat(duration),
  date: date.toDateString(),
    _id: userId})
    });
  
  
  
})

app.get("/api/users/:_id/logs", (req,res) => {
  let userId = req.params._id;
  let fromQr = req.query.from;
  let toQr = req.query.to;
  let limitQr = req.query.limit;

  userModel.find({_id: userId}).then((data) => {
    data = data[0].toJSON();
    let newLog = data.log.map((e) => {let log = { ...e }
                                        log.date = new Date(e.date).toDateString();
                                       // console.log("log: ",log);
                                       return log})
    modifiedLog = newLog;
   
    if(fromQr && toQr){

      modifiedLog = modifiedLog.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() );
      console.log("modification: ",modifiedLog)
      modifiedLog = modifiedLog.filter((element) => {
    return new Date(element.date).getTime() >= new Date(fromQr).getTime() &&
           new Date(element.date).getTime() <= new Date(toQr).getTime();
});
    }
    if(limitQr){
      console.log("limit: ",limitQr);
      modifiedLog = modifiedLog.slice(0, limitQr);
    }
    console.log("finalLog:", modifiedLog);
    res.json({username: data.username,
             count: data.log.length,
              _id: userId,
              log: modifiedLog
             }
            )
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


