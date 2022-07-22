
const request = require('request');
require('dotenv').config();
var fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');

class Main2 {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    //  Find the master repository
    getRootRepository(repoApiUrl) {
        return new Promise((resolve, rejects) => {
            request({
                url: repoApiUrl,
                headers: {
                    'User-Agent': 'PostmanRuntime/7.29.0',
                    'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
                }
            },
                (err, res, body) => {
                    var result = JSON.parse(body);
                    if (result.fork == false) {
                        resolve(result.url);
                    } else {
                        resolve(this.getRootRepository(result.parent.url));
                    }
                })
        });
    }

    getForkPerPage(apiUrl) {
        return new Promise((resolve, rejects) => {
            var forkListUrl = apiUrl;
            var options = {
                url: forkListUrl,
                headers: {
                    'User-Agent': 'Chrome',
                    'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
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

    listBranch(url) {
        return new Promise((resolve, rejects) => {
            var apiUrl = `${url}/branches`;
            console.log(apiUrl);
            var options = {
                url: apiUrl,
                headers: {
                    'User-Agent': 'PostmanRuntime/7.29.0',
                    'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
                }
            }
            request(options, (err, result, body) => {
                resolve(JSON.parse(body));
            })
        })
        
    }

    getRepository(apiUrl) {
        return new Promise((resolve, rejects) => {
            console.log(apiUrl);
            var options = {
                url: apiUrl,
                headers: {
                    'User-Agent': 'PostmanRuntime/7.29.0',
                    'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
                }
            }
            request(options, (err, result, body) => {
                resolve(JSON.parse(body));
            })
        })
    }

    async run() {
        var branchArray = await this.listBranch(this.apiUrl);
        var repository = await this.getRepository(this.apiUrl);
        console.log(repository);

        var rootApiUrl = await this.getRootRepository(this.apiUrl);
        var forkArray = await this.getAllForkRepository(rootApiUrl);

        var compareArray = [];

        for (let forkRepo of forkArray) {
            let compareRepo = {
                full_name: forkRepo.full_name,
                url: forkRepo.url
            };

            let branches = await this.listBranch(forkRepo.url);
            let compareWithBranch = repository.default_branch;

            let branchList = [];
            for (let branch of branches) {
                let currentBranch = {
                    branch_name: branch.name
                };
                //  Find root branch
                for (let i = 0; i < branchArray.length; ++i) {
                    if (branch.name == branchArray[i].name) {
                        compareWithBranch = branch.name;
                        break;
                    }
                }
                currentBranch.adheadCommits = await this.compareBranch(
                  compareWithBranch, forkRepo.owner.login, forkRepo.name, branch.name
                );
                branchList.push(currentBranch);
            }

            compareRepo.branches = branchList;
            compareArray.push(compareRepo);
        }

        fs.writeFileSync('testFile.json', JSON.stringify(compareArray));
    }

    async compareBranch(rootBranch, compareUser, compareRepo, compareBranch) {
        return new Promise((resolve, rejects) => {
            var compareUrl = `${this.apiUrl}/compare/${rootBranch}...${compareUser}:${compareRepo}:${compareBranch}`;
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
                var result = data;
                if (data.ahead_by > 0) {
                    var commits = data.commits;
                    var commitsSort = [];
                    for (let commit of commits) {
                        commitsSort.push({
                            sha: commit.sha,
                            html_url: commit.html_url
                        });
                    }
                    resolve(commitsSort);
                } else {
                    resolve([]);
                }
            })
        })
        
    }
}

exports.Main2 = Main2;