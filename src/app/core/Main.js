const config = require('../config');
const request = require('request');

class Main {
    constructor(apiUrl, callback) {
        this.getRootRepository(apiUrl, (url) => {
            this.rootApiUrl = url;
            this.getAllForkRepository(this.rootApiUrl).then((forkRepoList) => {
                this.forkUrlArray = forkRepoList;
                callback();
            })
        })
    }

    getRootRepository(repoApiUrl, callback) {
        request({
            url: repoApiUrl,
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.0',
                'Authorization': `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        },
            (err, res, body) => {
                var result = JSON.parse(body);
                console.log(result);
                if (result.fork == false) {
                    callback(result.url);
                } else {
                    this.getRootRepository(result.parent.url, callback);
                }
            })
    }

    getForkPerPage(apiUrl) {
        return new Promise((resolve, rejects) => {
            var forkListUrl = apiUrl;
            var options = {
                url: forkListUrl,
                headers: {
                    'User-Agent': 'Chrome',
                    'Authorization': `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`
                }
            };
            request(options, (err, res, body) => {
                resolve(body);
            })
        })
    }

    async getAllForkRepository(rootApiUrl) {
        var repoUrlArray = [];
        repoUrlArray.push(rootApiUrl);
        var forkRepoUrlArray = [];
        while(repoUrlArray.length > 0) {
            var apiUrl = repoUrlArray.pop();
            var stop = false;
            var page = 1;
    
            while(!stop) {
                var forkUrl = apiUrl + `/forks?per_page=100&page=${page}`;
                var res = await this.getForkPerPage(forkUrl);
                var forkArray = JSON.parse(res);
                if (forkArray.length == 0) {
                    stop = true;
                } else {
                    for (var fork of forkArray) {
                        if (fork.forks_count > 0) repoUrlArray.push(fork.url);
                        forkRepoUrlArray.push(fork);
                    }
                    ++page;
                }
                break;
            }
            break;
        }
        return forkRepoUrlArray;
    }
    
    getAllBranches(url) {
        return new Promise((resolve, rejects) => {
            var branchListUrl = url + '/branches';
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
    }
    
    getAheadCommit(rootUrl, user, repoName, branchName) {
        return new Promise((resolve, rejects) => {
            var compareUrl = rootUrl + `/compare/master...${user}:${repoName}:${branchName}`;
            console.log(compareUrl);
            var options = {
                url: compareUrl,
                headers: {
                    'User-Agent': 'Chrome',
                    'Authorization': 'token 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'
                }
            };
            request(options, (err, res, body) => {
                resolve(JSON.parse(body).commits);
            })
        })
    }
}

exports.Main = Main;