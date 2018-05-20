# Twitter to SSB Import 

Script to import tweets from Twitter to ssb, so that they will display in Patchwork.

1. Request your Twitter archive. You will be emailed a ZIP file.

2. Unzip, and find the archive of your tweets in `data/js/tweets`. There should be a bunch of files that look like `2018_02.js`. Put the full path to the `tweets` directory in `config.js`

3. Edit `config.js`:
    - `screen_name`: Your Twitter screen name -- the handle with "@" in front, but without the "@".
    - `data_dir`: The directory with your tweets. Defaults to a directory called 'data' in here.
    - `retweets`: Set true to include retweets, false to not include.
    - `from`: The earliest [year, month, day] you want to start importing tweets from.
    - `to`: The latest [year, month, day] you want to import tweets up to.
    - `dry_run`: Set true to only preview, and not add to ssb. Recommended for first run. Set false to actually import into ssb. You cannot delete tweets once added, so be sure to be certain before you actually add tweets. 
    
4. Run `npm install`.

5. Start [Patchwork](https://github.com/ssbc/patchwork) in another window. 

6. Run `npm start`. You will be prompted to preview the tweets being added, and delete ones you do not want imported. Tweets will be chronologically sorted, and posted from earliest to latest. 


**Warning:** This is a preliminary implementation, use at your own risk.
