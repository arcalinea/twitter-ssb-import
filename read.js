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
        
        var from = ['2018', '02'];
        var to = ['2018', '03'];
        var filesToBeAdded = orderDates(files, from, to);

        console.log("Include retweets:", twitterConfig.retweets)
        filesToBeAdded.forEach( function( file, index ) {
                // parse each tweet file
                var filePath = path.join( dataDir, file );
                var tweetObj = parseTweets(filePath);
                for (var t in tweetObj){
                    var tweet = tweetObj[t];
                    //  Cases: retweets, own tweets, own replies
                    if(twitterConfig.retweets){
                        //  include retweets
                        if (isRetweet(tweet)) {
                            console.log("\nIncluding retweet");
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

function orderDates(files, from, to){
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
    var tweetObj = JSON.parse(jsonData);
    return tweetObj
}
