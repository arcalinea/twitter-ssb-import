var ssbKeys = require('ssb-keys')
var ssbClient = require('ssb-client')
var ssbConfig = require('ssb-config/inject')('ssb', {port: 8008})
const fs = require('fs');
const readline = require('readline');
const path = require('path');
var moment = require('moment');
var prompt = require('prompt-sync')();

const twitterConfig = require('./config');

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
            
            var filesToBeAdded = getFilesToAdd(files);
            var tweetsToBeAdded = getTweetsToAdd(filesToBeAdded);
            var previewedTweets = previewTweets(tweetsToBeAdded);
            var tweets = orderTweetsByTime(previewedTweets);
            
            if(!twitterConfig.dry_run){
                console.log("Publishing tweets to ssb...");
                index = Object.keys(tweets)[Object.keys(tweets).length-1];
                while (index > -1){
                    if (tweets[index]) {
                        sbot.publish({type: "post", text: tweets[index]['text']}, function (err, msg) {
                            if (err) throw err
                            console.log("Published: ", msg)
                        })
                    }
                    index -= 1;
                }
            } else {
                console.log("Finished preview. To add tweets to ssb, change 'dry_run' field in config.js to 'false'.")
            }
            
            sbot.close()
    })
})


function isRetweet(tweet){
    if(tweet['retweeted_status']){
        return true;
    }
    return false;
}

function isMyTweet(tweet){
    var bool = false;
    if(!tweet['retweeted_status'] && tweet['in_reply_to_screen_name'] == twitterConfig.screen_name){
        if (tweet['text'].slice(0, 1) != '@') {
            bool = true;
        }
    } else if (!tweet['retweeted_status'] && !tweet['in_reply_to_screen_name']){
        bool = true;
    }
    return bool;
}

function getFilesToAdd(files){
    var from = twitterConfig.from;
    var to = twitterConfig.to;
    filesToBeAdded = []
    for (i in files){
        var file = files[i];
        var fileDate = file.slice(0, -3).split('_');
        var fromCutoff = parseInt(from[0]) + parseInt(from[1]);
        var toCutoff = parseInt(to[0]) + parseInt(to[1]);
        var fileDate = parseInt(fileDate[0]) + parseInt(fileDate[1]);
        if (fromCutoff <= fileDate && fileDate <= toCutoff) {
            filesToBeAdded.push(file);
        }
    }
    console.log(filesToBeAdded);
    return filesToBeAdded;
}

function parseTweets(filePath){
    var data = fs.readFileSync(filePath, 'utf8');
    var jsonData = data.split('\n').slice(1).join('\n');
    var tweetJSON = JSON.parse(jsonData);
    return tweetJSON
}

function getTweetsToAdd(files){
    var tweetsToBeAdded = {};
    var counter = 0;
    for (index = 0; index < files.length; ++index) {
            // parse each tweet file
            var filePath = path.join( dataDir, files[index] );
            var tweetJSON = parseTweets(filePath);
            var tTime = moment('1999-03-28', "YYYY-MM-DD");
            for (var t in tweetJSON){
                var tweet = tweetJSON[t];
                var tweetTime = moment(Date.parse(tweet['created_at']));
                var from = moment(twitterConfig.from.join('-'), "YYYY-MM-DD");
                var to = moment(twitterConfig.to.join('-'), "YYYY-MM-DD");
                if (tweetTime > from && tweetTime < to){
                    var tweetStr = "[From Twitter](" + "https://twitter.com/" + twitterConfig.screen_name + "/status/" + tweet['id_str'] + "): " + tweet['text'];
                    var tweetObj = {
                        'text': tweetStr,
                        'created_at': tweet['created_at']
                    };
                    if(twitterConfig.retweets){
                        if (isRetweet(tweet)) {
                            tweetObj['type'] = "retweet";
                            tweetsToBeAdded[counter] = tweetObj;
                            counter += 1;
                        }
                    }
                    // Include my own tweets, regardless of config 
                    if (isMyTweet(tweet)){
                        tweetObj['type'] = "my tweet";
                        tweetsToBeAdded[counter] = tweetObj;
                        counter += 1;
                    }
                }
            }
        }
    return tweetsToBeAdded
}

function previewTweets(tweets){
    console.log(tweets)
    var discard = prompt("To confirm, respond 'y'. To cancel, respond 'n' or 'c'. To NOT add any of the tweets above, enter their numerical IDs, separated by commas => ");
    console.log(discard);
    if (discard == 'y') {
        return tweets
    } else if (discard == 'n' || discard == 'c'){
        process.exit( 1 );
    }
    var strs = discard.split(',');
    var discarded = [];
    for (d in strs) {
        discarded.push(parseInt(strs[d]));
    }
    console.log("Discarded", discarded);
    for (var key in tweets) {
        if (discarded.includes(parseInt(key))){
            delete tweets[key];
        }
    }
    console.log("Tweets to be added after edits:", tweets);
    var confirm = prompt("To add the tweets above, respond 'y'. To remove more tweets, respond 'n'. To cancel, respond 'c'. => ")
    if (confirm == 'y'){
        return tweets
    } else if (confirm == 'n') {
        previewTweets(tweets);
    } else {
        process.exit( 1 );
    }
}
