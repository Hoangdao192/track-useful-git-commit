const express = require('express');
//  Template engine
const handlebars = require('express-handlebars');
const mainController = require('./app/controllers/MainController');
const apiController = require('./app/controllers/APIController');

const app = express();
const port = 3000;

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


