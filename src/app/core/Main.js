
const request = require('request');
require('dotenv').config();
var fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');

class Main {
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
                        console.log(result.url);
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
                console.log(forkUrl);
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
            }
        }
        console.log(forkRepoUrlArray.length);
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
        //  Load main repository
        this.repository = await this.getRepository(apiUrl);
        this.branches = await this.listBranch(apiUrl);

        var branchArray = await this.listBranch(this.apiUrl);
        var repository = await this.getRepository(this.apiUrl);

        var rootApiUrl = await this.getRootRepository(this.apiUrl);
        var forkArray = await this.getAllForkRepository(rootApiUrl);

        var compareArray = [];

        for (let forkRepo of forkArray) {
            let compareRepo = {
                full_name: forkRepo.full_name,
                url: forkRepo.url
            };

            let branches = await this.listBranch(forkRepo.url);

            var promise = new Promise((resolve, rejects) => {
                var result = this.compareWithForkRepository(repository.full_name, repository.default_branch, branchArray,
                    forkRepo.owner.login, forkRepo.name, branches, (data) => {
                        resolve(data);
                    })
            })
            let branchAheadCommit = await promise;

            compareRepo.branches = branchAheadCommit;
            compareArray.push(compareRepo);
        }

        fs.writeFileSync('testFile.json', JSON.stringify(compareArray));
    }

    //  Compare main repository with fork repository
    async compareWithForkRepository(compareUser, compareRepo, compareBranchList, callback) {
        this.repository = await this.getRepository(this.apiUrl);
        this.branches = await this.listBranch(this.apiUrl);
        var branches = [];

        for (let branch of compareBranchList) {
            let rootBranch = "";
            //  Find branch with the same name
            for (let i = 0; i < this.branches.length; ++i) {
                if (this.branches[i].name == branch.name) {
                    rootBranch = branch.name;
                    break;
                }
            }

            let aheadCommits = [];
            if (rootBranch == "") {
                for (let i = 0; i < this.branches.length; ++i) {
                    let resultCommits = await this.compareBranch(this.branches[i].name, compareUser, compareRepo, branch.name);
                    if (resultCommits.length == 0) {
                        aheadCommits = [];
                        break;
                    } else {
                        if (!resultCommits[0].hasOwnProperty('comparable')) {
                            aheadCommits = aheadCommits.concat(resultCommits);
                        }
                    }
                }
                //  Delete duplcate commit
                if (aheadCommits.length > 0) {
                    var uniqueAheadCommits = 
                        Array.from(new Set(aheadCommits.map(commit => commit.sha)))
                            .map(sha => {
                                return aheadCommits.find(commit => commit.sha === sha);
                            });
                    aheadCommits = uniqueAheadCommits;
                }
            } else {
                aheadCommits = await this.compareBranch(rootBranch, compareUser, compareRepo, branch.name);
            }

            branches.push(
                {
                    branch_name: branch.name,
                    aheadCommits: aheadCommits
                });
        }
        callback(branches);
    }

    async compareWithRepository(repositoryApiUrl, callback) {
        var compareRepository = await this.getRepository(repositoryApiUrl);
        var compareBranchList = await this.listBranch(repositoryApiUrl);
        var compareUser = compareRepository.owner.login;
        var compareRepo = compareRepository.name;

        this.repository = await this.getRepository(this.apiUrl);
        this.branches = await this.listBranch(this.apiUrl);
        var branches = [];

        for (let branch of compareBranchList) {
            let rootBranch = "";
            //  Find branch with the same name
            for (let i = 0; i < this.branches.length; ++i) {
                if (this.branches[i].name == branch.name) {
                    rootBranch = branch.name;
                    break;
                }
            }

            let aheadCommits = [];
            if (rootBranch == "") {
                for (let i = 0; i < this.branches.length; ++i) {
                    let resultCommits = await this.compareBranch(this.branches[i].name, compareUser, compareRepo, branch.name);
                    if (resultCommits.length == 0) {
                        aheadCommits = [];
                        break;
                    } else {
                        if (!resultCommits[0].hasOwnProperty('comparable')) {
                            aheadCommits = aheadCommits.concat(resultCommits);
                        }
                    }
                }
                //  Delete duplcate commit
                if (aheadCommits.length > 0) {
                    var uniqueAheadCommits = 
                        Array.from(new Set(aheadCommits.map(commit => commit.sha)))
                            .map(sha => {
                                return aheadCommits.find(commit => commit.sha === sha);
                            });
                    aheadCommits = uniqueAheadCommits;
                }
            } else {
                aheadCommits = await this.compareBranch(rootBranch, compareUser, compareRepo, branch.name);
            }

            branches.push(
                {
                    branch_name: branch.name,
                    aheadCommits: aheadCommits
                });
        }
        callback(branches);
    }

    //  Return an array of ahead commits
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
                //  Cannot compare
                if (!data.url) {
                    resolve([{comparable: false}]);
                }

                var result = data;
                if (data.ahead_by > 0) {
                    var commits = data.commits;
                    var commitsSort = [];
                    for (let commit of commits) {
                        commitsSort.push(commit);
                    }
                    resolve(commitsSort);
                } else {
                    resolve([]);
                }
            })
        })
        
    }
}

exports.Main = Main;