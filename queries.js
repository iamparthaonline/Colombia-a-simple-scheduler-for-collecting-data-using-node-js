const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const articleAdaptar = new FileAsync('articleDb.json')
const sourceAdaptar = new FileAsync('sourceDb.json')

/* -- Defaults -- */

low(articleAdaptar)
    .then(db => {
        db.defaults({ articles: [] })
            .write()
    });

low(sourceAdaptar)
    .then(db => {
        db.defaults({ sources: []})
            .write()
    });

/* -- Article CRUD -- */

function addNewArticle(newArticleData) {
    low(articleAdaptar)
        .then(db => {
            db.get('articles')
                .push(newArticleData)
                .write()
        });
}

function getArticleByName(name, callback) {
    low(articleAdaptar)
        .then(db => {
            let list = db.get('articles').filter(data => data.name === name).value();
            callback(list);            
        });
}

function getAllArticles() {
    return low(articleAdaptar)
        .then(db => {
            return db.get('articles')
        });
}

/* -- Source CRUD -- */

function addNewSource(newSourceData) {
    low(sourceAdaptar)
        .then(db => {
            db.get('sources')
                .push(newSourceData)
                .write()
        });
}

function getAllSources(callback) {
    return low(sourceAdaptar)
        .then(db => {
            let data = db.get('sources').value();
            callback(data);
        });
}




module.exports = {
    getAllArticles,
    addNewArticle,
    addNewSource,
    getAllSources,
    getArticleByName
};