var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;

var port = process.env.PORT || 9000;

var db;
var mongoHost = '[REDACTED]'

var Twitter = require('node-tweet-stream')
  , t = new Twitter({
    consumer_key: '[REDACTED]',
    consumer_secret: '[REDACTED]',
    token: '[REDACTED]',
    token_secret: '[REDACTED]'
  });


app.use(express.static(path.join(__dirname, 'public')));

app.get('/mentions/geotagged', function(req, res){
  var collection = db.collection('mentions');
  collection.find().toArray(function(err, items){
    if(err) throw err;

    res.send(items);
  });
});

// app.get('/', function(req, res){
//   res.sendFile(__dirname + 'public/index.html');
// });

io.on('connection', function(socket){
  console.log('a user connected!');
});

function handleMention(candidate, party, mention){
  mention.candidate = candidate;
  mention.party = party;
  if(mention.coordinates){
    var collection = db.collection('mentions');
    collection.insert(mention, function(){});
  }

  // socket handle
  io.emit('mention', mention);
}

MongoClient.connect(mongoHost, function(err, database){
  if(err) throw err;

  db = database;

  http.listen(port, function(){
    console.log('listening on *' + port);
  });

  t.on('tweet', function (tweet) {

    // console.log('tweet');

    var text = tweet.text;

    var mention = {
      text : text,
      coordinates : tweet.coordinates,
      timestamp : tweet.timestamp_ms
      // issues : []
    };

    // if(/inequality/i.exec(text)){ //|| text.match(/income/i){
    //   mention.issues.push['inequality'];
    // }
    // if(/gun/i.exec(text)){ // || text.match(/mass shooting/i) || text.match(/nra/i)){
    //   mention.issues.push['gun control'];
    // }
    // if(/climate/i.exec(text)){ // || text.match(/global warming/i)){
    //   mention.issues.push['climate change'];
    // }
    // if(/education/i.exec(text)){ // || text.match(/tuition/i) || text.match(/college/i) ||
    //   mention.issues.push['education'];
    // }
    // if(/immigra/i.exec(text)){
    //   mention.issues.push['immigration'];
    // }
    // if(/health|obama\s?care/i.exec(text)){
    //   mention.issues.push['health care'];
    // }
    // if(/foreign policy/i.exec(text)){ //|| text.match(/syria/i) || text.match(/iran/i) ||
    //   mention.issues.push['foreign policy'];
    // }


    if(text.match(/hillary/i) || text.match(/clinton/i)){
      handleMention('clinton', 'dem', mention);
    }
    if(text.match(/bernie/i) || text.match(/sanders/i)){
      handleMention('sanders', 'dem', mention);
    }

    if(text.match(/donald/i) || text.match(/trump/i)){
      handleMention('trump', 'rep', mention);
    }
    if(text.match(/ben/i) || text.match(/carson/i)){
      handleMention('carson', 'rep', mention);
    }
    if(text.match(/jeb/i) || text.match(/bush/i)){
      handleMention('bush', 'rep', mention);
    }
    if(text.match(/marco/i) || text.match(/rubio/i)){
      handleMention('rubio', 'rep', mention);
    }
    if(text.match(/carly/i) || text.match(/fiorina/i)){
      handleMention('fiorina', 'rep', mention);
    }
    if(text.match(/ted/i) || text.match(/cruz/i)){
      handleMention('cruz', 'rep', mention);
    }

  });

  t.on('error', function (err) {
    console.log('Oh no')
  });

  t.trackMultiple([
    'HillaryClinton',
    'BernieSanders',
    'realDonaldTrump',
    'RealBenCarson',
    'JebBush',
    'marcorubio',
    'CarlyFiorina',
    'tedcruz'
  ]);
})
