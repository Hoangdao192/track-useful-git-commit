const util = require('../util/Util');
const request = require('request');
const { Main } = require('../core/Main');
const main = require('../core/Main');
require('dotenv').config();

class MainController {
    home(req, res) {
        res.render('home');
    }

    convertToApiUrl(url) {
        var githubRepoUrl = req.body.url;
        console.log(githubRepoUrl);
        githubRepoUrl = util.trim(githubRepoUrl, '/');
        githubRepoUrl = util.trim(githubRepoUrl, '\\');
        
        var parseUrl = githubRepoUrl.split('/');
        var apiUrl = `https://api.github.com/repos/${parseUrl[3]}/${parseUrl[4]}`;
        return apiUrl;
    }

    run(req, res) {
        var githubRepoUrl = req.body.url;
        githubRepoUrl = util.trim(githubRepoUrl, '/');
        githubRepoUrl = util.trim(githubRepoUrl, '\\');
        
        var parseUrl = githubRepoUrl.split('/');
        var apiUrl = `https://api.github.com/repos/${parseUrl[3]}/${parseUrl[4]}`;

        var main = new Main(apiUrl, () => {
            res.json(main.forkUrlArray);
        })
    }

    app(req, res) {
        var githubRepoUrl = req.body.url;
        console.log(githubRepoUrl);
        githubRepoUrl = util.trim(githubRepoUrl, '/');
        githubRepoUrl = util.trim(githubRepoUrl, '\\');
        
        var parseUrl = githubRepoUrl.split('/');
        var repositoryFullName = `${parseUrl[3]}/${parseUrl[4]}`;
        var apiUrl = `https://api.github.com/repos/${repositoryFullName}`;

        request({
            url: apiUrl,
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.0',
                'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        }, (err, response, body) => {
            var result = JSON.parse(body);
            res.render('app', {
                repository: result
            })
        });
    }

    getAllBranch(req, res) {
        var promise = new Promise((resolve, rejects) => {
            var branchListUrl = req.body.url + '/branches';
            var options = {
                url: branchListUrl,
                headers: {
                    'User-Agent': 'Chrome',
                    'Authorization': 'token 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'
                }
            };
            request(options, (err, res, body) => {
                resolve(JSON.parse(body));
            })
        })
        promise.then((data) => {
            res.json(data);
        })
        // Main.getAllBranches(apiUrl).then((data) => {
        //     res.json(data);
        // })
    }
    
    compareBranch(req, res) {
        var rootFullName = req.body.rootFullName;
        var rootBranch = req.body.rootBranch;
        var compareUser = req.body.compareUser;
        var compareRepo = req.body.compareRepo;
        var compareBranch = req.body.compareBranch;
        var compareUrl = `https://api.github.com/repos/${rootFullName}/compare/${rootBranch}...${compareUser}:${compareRepo}:${compareBranch}`;
        console.log(compareUrl);
        var promise = new Promise((resolve, rejects) => {
            var options = {
                url: compareUrl,
                headers: {
                    'User-Agent': 'Chrome',
                    'Authorization': `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`
                }
            };
            request(options, (err, res, body) => {
                resolve(JSON.parse(body));
            })
        })

        promise.then((data) => {
            res.send(data);
        })
    }

    trackCommit(req, res) {
        var rootRepositoryFullName = req.body.rootFullName;
        var rootRepositoryBranch = req.body.rootBranch;
        var forkRepoUrl = req.body.forkRepoUrl;
        var options = {
            url: forkRepoUrl,
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.0',
                'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        };
        request(options, (err, response, body) => {
            var result = JSON.parse(body);
            res.render('fork_repo.hbs', {
                rootRepositoryFullName: rootRepositoryFullName,
                rootRepositoryBranch: rootRepositoryBranch,
                repository: result
            })
        });
    }
}

module.exports = new MainController();