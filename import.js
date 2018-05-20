var ssbKeys = require('ssb-keys')
var ssbClient = require('ssb-client')
var ssbConfig = require('ssb-config/inject')('ssb', {port: 8008})
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const twitterConfig = require('./config');

ssbConfig.keys = ssbKeys.loadOrCreateSync(path.join(ssbConfig.path, 'secret'))

var id = ssbConfig.keys.id
ssbConfig.remote = `net:127.0.0.1:${ssbConfig.port}~shs:${id.slice(1).replace('.ed25519', '')}`

console.log("Publishing to ID", id)

// var filename = 'data/2018_05.js';
var dataDir = "data";

ssbClient(
  // ssbConfig.keys,                // optional, defaults to ~/.ssb/secret
  {
    host: '127.0.0.1', // optional, defaults to localhost
    port: ssbConfig.port,        // optional, defaults to 8008
    key: id,      // optional, defaults to keys.id
  },
  function (err, sbot, config) {
    if (err) throw(err)
    sbot.whoami(function (err, info) {
        if (err) throw err
        console.log('whoami', info)
    })
    
    // Loop through all the files in the data directory
    fs.readdir( dataDir, function( err, files ) {
            if( err ) {
                console.error( "Could not list the directory.", err );
                process.exit( 1 );
            } 

            files.forEach( function( file, index ) {
                    // parse each tweet file
                    var filePath = path.join( dataDir, file );
                    var allTweetData = parseTweetData(filePath);
                    for (var i in allTweetData){
                        var msg = allTweetData[i]['text'];
                        sbot.publish({type: "post", text: msg}, function (err, msg) {
                            if (err) throw err
                            console.log("Published", msg)
                        })
                    }
                    sbot.close()
                })
            })
    }
)

function parseTweetData(filePath){
    var data = fs.readFileSync(filePath, 'utf8');
    var jsonData = data.split('\n').slice(1).join('\n');
    var allTweetData = JSON.parse(jsonData);
    return allTweetData;
}
