var ssbKeys = require('ssb-keys')
var ssbClient = require('ssb-client')
var ssbConfig = require('ssb-config/inject')('ssb', {port: 8008})
const fs = require('fs');
const readline = require('readline');
const path = require('path');
var moment = require('moment');
var prompt = require('prompt-sync')();

const twitterConfig = require('./config');
const processTweets = require('./processTweets');

ssbConfig.keys = ssbKeys.loadOrCreateSync(path.join(ssbConfig.path, 'secret'))

var id = ssbConfig.keys.id
ssbConfig.remote = `net:127.0.0.1:${ssbConfig.port}~shs:${id.slice(1).replace('.ed25519', '')}`

console.log("Publishing to ID", id)

var dataDir = twitterConfig.data_dir;


ssbClient(
  // ssbConfig.keys,                // optional, defaults to ~/.ssb/secret
  {
    host: '127.0.0.1', // optional, defaults to localhost
    port: ssbConfig.port,        // optional, defaults to 8008
    key: id,      // optional, defaults to keys.id
  },
  function (err, sbot, config) {
    if (err) throw(err)
    
    // Loop through all the files in the data directory
    fs.readdir( dataDir, function( err, files ) {
            if( err ) {
                console.error( "Could not list the directory.", err );
                process.exit( 1 );
            } 
            
            var tweets = processTweets(files);
            
            if(!twitterConfig.dry_run){
                console.log("Publishing tweets to ssb...");
                for (i = 0; i < tweets.length; ++i) {
                    console.log(tweets[i]['text'])
                    sbot.publish({type: "post", text: tweets[i]['text']}, function (err, msg) {
                        if (err) throw err
                        console.log("Published: ", msg)
                    })
                    index -= 1;
                }
            } else {
                console.log("Finished preview. To add tweets to ssb, change 'dry_run' field in config.js to 'false'.")
            }
            
            sbot.close()
    })
})
