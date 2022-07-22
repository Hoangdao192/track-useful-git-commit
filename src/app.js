const express = require('express');
//  Template engine
const handlebars = require('express-handlebars');
const mainController = require('./app/controllers/MainController');
const apiController = require('./app/controllers/APIController');

const expressSession = require('express-session');

const app = express();
const port = process.env.PORT || 5000;

app.use(expressSession({
    secret: "HoangDao",
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 36000000
    }

}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//  Set template engine
app.engine(
    'hbs', 
    handlebars.engine({
        extname: 'hbs'
    })
);
app.set('view engine', 'hbs');
//  Set views folder
app.set('views', './src/resources/views');
//  Set static file directory
app.use(express.static('./src/public'));

app.get('/', mainController.home);
app.post('/log', mainController.run);
app.get('/app', mainController.app);
app.get('/track_commit', mainController.trackCommit);

app.get('/api/repository', apiController.getRepository);
app.post('/api/forks', apiController.listForkRepository);
app.post('/api/run', mainController.run);
app.post('/api/get_branch', mainController.getAllBranch);
app.post('/api/compare', apiController.compareBranch)
app.get('/api/branches', apiController.listRepositoryBranches);

app.get('/api/compare_repository', apiController.compareRepository);

app.listen(port, () => {});


