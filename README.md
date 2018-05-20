# Twitter to SSB Import 

Script to import tweets from Twitter to ssb, so that they will display in Patchwork.

1. Request your Twitter archive. You will be emailed a ZIP file.

2. Unzip, and move the folder containing your tweets to this directory. They will be in `data/js/tweets`. You should now have a directory called `data` here, with your tweet history here in files that look like `2018_02.js`.

3. Run `npm install`.

4. Edit `config.js`:
    - `screen_name`: Your Twitter screen name -- the handle with "@" in front, but without the "@".
    - `retweets`: Set true to include retweets, false to not include.
    - `from`: The earliest [year, month] you want to start importing tweets from.
    - `to`: The latest [year, month] you want to import tweets up to.
    - `dry_run`: Set true to only preview, and not add to ssb. Recommended for first run. Set false to actually import into ssb. You cannot delete tweets once added, so be sure to be certain before you actually add tweets. 
    
5. Start [Patchwork](https://github.com/ssbc/patchwork) in another window. 

6. Run `node import.js` to run import script. You will be prompted to preview the tweets being added, and delete ones you do not want imported. 


**Warning:** This is a preliminary implementation, use at your own risk.

### Todo: 

- Index by date of individual tweet, not just files
- CLI flags
