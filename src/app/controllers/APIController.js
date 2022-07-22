const request = require('request');
const { Main } = require('../core/Main');
const util = require('../util/Util');
require('dotenv').config();

class APIController {

    listRepositoryBranches(req, res) {
        var repositoryFullName = req.query.repositoryFullName;
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
        var firstRepositoryApiUrl = req.query.firstRepository;
        var secondRepositoryApiUrl = req.query.secondRepository;

        let main = new Main(firstRepositoryApiUrl);
        main.compareWithRepository(secondRepositoryApiUrl, (data) => {
            res.send(data);
        })
        // request({
        //     url: secondRepositoryApiUrl,
        //     headers: {
        //         'User-Agent': 'PostmanRuntime/7.29.0',
        //         'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
        //     }
        // }, (err, res, body) => {
        //     request({
        //         url: `${secondRepositoryApiUrl}/branches`,
        //         headers: {
        //             'User-Agent': 'PostmanRuntime/7.29.0',
        //             'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
        //         }
        //     }, (err, res, body2) => {
        //         let secondRepository = JSON.parse(body);
        //         let branchList = JSON.parse(body2);
        //         main.compareWithForkRepository(secondRepository.owner.login, secondRepository.name, branchList, 
        //             (data) => {
        //                 response.send(data);
        //             })
        //     })            
        // })
    }
}

module.exports = new APIController();