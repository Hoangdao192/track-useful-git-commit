const request = require('request');
const { Main } = require('../core/Main');
const util = require('../util/Util');
require('dotenv').config();

class APIController {

    listRepositoryBranches(req, res) {
        var repositoryFullName = req.query.repositoryFullName;

        //  Log
        console.log();
        console.log("API: get repository's branches");
        console.log("Repository: " + repositoryFullName);
        console.log();

        var apiUrl = `https://api.github.com/repos/${repositoryFullName}/branches`;
        console.log(apiUrl);
        var options = {
            url: apiUrl,
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.0',
                'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        }
        request(options, (err, result, body) => {
            res.send(body);
        })
    }

    getRepository(req, res) {
        var repositoryFullName = req.query.repositoryFullName;

        //  Log
        console.log();
        console.log("API: get repository");
        console.log("Repository: " + repositoryFullName);
        console.log();

        var apiUrl = `https://api.github.com/repos/${repositoryFullName}`;
        console.log(apiUrl);
        var options = {
            url: apiUrl,
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.0',
                'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        }
        request(options, (err, result, body) => {
            res.send(body);
        })
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
                    'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
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

    listForkRepository(req, res) {
        var githubRepoUrl = req.body.url;
        githubRepoUrl = util.trim(githubRepoUrl, '/');
        githubRepoUrl = util.trim(githubRepoUrl, '\\');

        //  Log
        console.log();
        console.log("API: get all fork repositories");
        console.log("Repository: " + githubRepoUrl);
        console.log();
        
        var parseUrl = githubRepoUrl.split('/');
        var apiUrl = `https://api.github.com/repos/${parseUrl[3]}/${parseUrl[4]}`;

        var main = new Main(apiUrl);
        main.getRootRepository(apiUrl).then((rootApiUrl) => {
            main.getAllForkRepository(rootApiUrl).then((forkList) => {
                let forkUrlArray = [];
                for (let fork of forkList) {
                    forkUrlArray.push({
                        url: fork.url,
                        fullName: fork.full_name
                    });
                }
                req.session.forkList = forkUrlArray;
                res.json(forkList);
            })
        })
    }

    compareRepository(req, res) {
        console.log("API: compare repository")
        var firstRepositoryApiUrl = req.query.firstRepository;
        var secondRepositoryApiUrl = req.query.secondRepository;

        //  Log
        console.log();
        console.log("API: compare repository");
        console.log("First repository: " + firstRepositoryApiUrl);
        console.log("Second repository: " + secondRepositoryApiUrl)
        console.log();

        let main = new Main(firstRepositoryApiUrl);
        main.compareWithRepository(secondRepositoryApiUrl, (data) => {
            res.send(data);
        })
    }
}

module.exports = new APIController();