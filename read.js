const fs = require('fs');
const readline = require('readline');
const path = require('path');
const twitterConfig = require('./config');

// var filename = 'data/2018_05.js';
var dataDir = "data";

// Loop through all the files in the data directory
fs.readdir( dataDir, function( err, files ) {
        if( err ) {
            console.error( "Could not list the directory.", err );
            process.exit( 1 );
        } 

        console.log("Include retweets:", twitterConfig.retweets)
        files.forEach( function( file, index ) {
                // parse each tweet file
                var filePath = path.join( dataDir, file );
                var tweetObj = parseTweets(filePath);
                for (var t in tweetObj){
                    var tweet = tweetObj[t];
                    //  Cases: retweets, own tweets, own replies
                    if(twitterConfig.retweets){
                        //  include retweets
                        if (isRetweet(tweet)) {
                            console.log("\nIncluding retweets");
                            console.log(tweet['text'])
                        }
                    }
                    // Include my own tweets, regardless of config 
                    if (isMyTweet(tweet)){
                        console.log("\nIncluding my own tweet")
                        console.log(tweet['text'])
                    }
                }
            })
        })

function isRetweet(tweet){
    if(tweet['retweeted_status']){
        return true;
    }
    return false;
}

function isMyTweet(tweet){
    if(!tweet['retweeted_status'] && tweet['in_reply_to_screen_name'] == twitterConfig.screen_name){
        if (tweet['text'].slice(0, 1) != '@') {
            return true;
        }
    }
    return false;
}

function parseTweets(filePath){
    var data = fs.readFileSync(filePath, 'utf8');
    var jsonData = data.split('\n').slice(1).join('\n');
    var tweetObj = JSON.parse(jsonData);
    return tweetObj
}
