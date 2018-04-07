const request = require('request');
const express = require('express')
const app = express();
const exphbs = require('express-handlebars');
var cheerio = require('cheerio');
var $;
var bodyParser = require('body-parser');
var path = require('path');

/* -- Other scripts -- */ 
var db = require('./queries');
var executer = require('./scheduler');



/* -- app Configuration -- */
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));




/* --- Main Methods --- */

var getLinkText = (linkArray, keywords, source) => {
    var data = [];
    linkArray.map((str, index) => {
        var anchorText = str.toLowerCase().substring(str.indexOf(">") + 1, str.length);
        var anchorLink = createFullUrl(getBaseUrl(source), getUrl(str));
        source = getBaseUrl(source);
        if (!anchorText.toLowerCase().includes('<img')) {
            var availableFlag = false;
            var availableKeywords = [];
            for (var i = keywords.length - 1; i >= 0; i--) {
                if (searchValue(anchorText, keywords[i])) {
                    availableFlag = true;
                    availableKeywords.push(keywords[i]);
                }
            }
            availableKeywords = availableKeywords.toString();
            if (availableFlag) {
                data.push({ anchorText, anchorLink, availableKeywords, source });
            }
        }
    });
    return data;
}

var colombia = (res, urls, data, counter, keywords, name, time, isSchedule) => {

    const baseCounter = counter;
    request(urls[counter], function(error, response, html) {

        if (!error) {

            $ = cheerio.load(html);
            var stringsArray = $.html('a').split('</a>');
            var linkData = getLinkText(stringsArray, keywords, urls[counter]);
            data = data.concat(linkData);

            if (counter > 0) {

                return colombia(res, urls, data, --counter, keywords, name, time);
            } else {

                saveArticle(data, name, time);                
                if(!isSchedule){
                    
                    scheduler({}, urls, data, baseCounter, keywords, name, Date.now(), true);
                    return res.render('results', { results: data, name: name });                  
                }
            }
        }
    });
}

var saveArticle = (articleDataList, name, time) => {

        db.addNewArticle({article: [{data: articleDataList, time: time}], name: name });
}

/* --- Utility Methods --- */

var getUrl = (str) => {
    
    str = str.toLowerCase();
    var tempStr = str.substring(str.indexOf("href=\"") + 6, str.length);
    return tempStr.substring(0, tempStr.indexOf('\"'));
}

var getBaseUrl = (url) => {

    var pathArray = url.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    url = protocol + '//' + host;
    return url;
}

var createFullUrl = (baseUrl, url) => {

    return (url.includes('http') ? url : (baseUrl + url));
}

var searchValue = (targetString, searchTerm) => {

    return (targetString.toLowerCase().includes(searchTerm.toLowerCase()));
}

var createName = (str) => {
    
    return ( str.split(' ').join('_') +'___'+ Date.now() );
}

/*--- Executer Configuration ---*/
var scheduler = (res, urls, data, counter, keywords, name, time, isSchedule) => {
    
    executer.scheduleMin((fireTime)=> {
        colombia (res, urls, data, counter, keywords, name, fireTime, isSchedule);        
    });
}

/* -- Static Paths -- */

app.use('/js', express.static(path.join(__dirname, 'assets/js')));
app.use('/css', express.static(path.join(__dirname, 'assets/css')));


/*-- Routes --*/ 

app.get('/', function(req, res) {

    db.getAllSources((sourcesArray) => {
        res.render('colombia', { sourcesArray });
    });
    
});

app.post('/results', function(req, res) {

    var urls = req.body.urls.split(',');
    var name = createName(req.body.search_name);
    colombia(res, urls, [], (urls.length - 1), req.body.keywords.split(','), name, Date.now());
});

/* -- Get Results By name -- */
app.get('/list/:name', function(req, res) {

    db.getArticleByName(req.params.name, (sourcesArray) => {
        res.render('list', { results: sourcesArray });
    });
});


/* -- Server configs --*/ 
app.listen(3030, () => {
    console.log('Colombia is up at http://localhost:3030');
});

