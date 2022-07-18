const util = require('../util/Util');
const config = require('../config');
const request = require('request');
const { Main } = require('../core/Main');
const main = require('../core/Main');

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
        var apiUrl = `https://api.github.com/repos/${parseUrl[3]}/${parseUrl[4]}`;

        request({
            url: apiUrl,
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.0',
                'Authorization': `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        }, (err, response, body) => {
            console.log(body);
            var result = JSON.parse(body);
            res.render('app', {
                url: githubRepoUrl,
                apiUrl: apiUrl,
                userAvatar: result.owner.avatar_url,
                userName: result.owner.login,
                repository: result.full_name,
                defaultBranch: result.default_branch
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
        var rootUrl = req.body.rootUrl;
        var rootBranch = req.body.rootBranch;
        var compareUser = req.body.compareUser;
        var compareRepo = req.body.compareRepo;
        var compareBranch = req.body.compareBranch;
        var branchListUrl = rootUrl + `/compare/${rootBranch}...${compareUser}:${compareRepo}:${compareBranch}`;
        var promise = new Promise((resolve, rejects) => {
            var branchListUrl = rootUrl + `/compare/${rootBranch}...${compareUser}:${compareRepo}:${compareBranch}`;
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
            res.send(branchListUrl);
        })
    }
}

module.exports = new MainController();