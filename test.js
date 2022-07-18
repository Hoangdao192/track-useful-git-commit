var request = require('request');
var fs = require('fs');

function getForkPerPage(apiUrl) {
    return new Promise((resolve, rejects) => {
        var forkListUrl = apiUrl;
        console.log(forkListUrl);
        var options = {
            url: forkListUrl,
            headers: {
                'User-Agent': 'Chrome',
                'Authorization': 'token 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'
            }
        };
        request(options, (err, res, body) => {
            resolve(body);
        })
    })
}

var linkRepo = "https://api.github.com/repos/moonlight-stream/moonlight-embedded";
var rootRepo = linkRepo;

async function getAllForkRepository(rootApiUrl) {
    var repoUrlArray = [];
    repoUrlArray.push(rootApiUrl);
    var forkRepoUrlArray = [];
    while(repoUrlArray.length > 0) {
        var apiUrl = repoUrlArray.pop();
        var stop = false;
        var page = 1;

        while(!stop) {
            var forkUrl = apiUrl + `/forks?per_page=100&page=${page}`;
            var res = await getForkPerPage(forkUrl);
            var forkArray = JSON.parse(res);
            if (forkArray.length == 0) {
                stop = true;
            } else {
                for (var fork of forkArray) {
                    if (fork.forks_count > 0) repoUrlArray.push(fork.url);
                    forkRepoUrlArray.push(fork.url);
                }
                ++page;
            }
        }
    }
    return forkRepoUrlArray;
}

function getAllBranches(url) {
    return new Promise((resolve, rejects) => {
        var branchListUrl = url + '/branches';
        console.log(branchListUrl);
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

function getAheadCommit(rootUrl, user, repoName, branchName) {
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

getAheadCommit(rootRepo, "4ydx", "moonlight-embedded", "master").then((value)=>{
    console.log(value.length);
})

// getAllForkRepository(linkRepo).then(async (forkRepoUrlArray) => {
//     for (var forkRepo of forkRepoUrlArray) {

//         var parameters = forkRepo.split('/');
//         var user = parameters[4];
//         var repo = parameters[5];

//         var branchesArray = await getAllBranches(forkRepo);
//         var aheadCommitArray = [];
//         for (var branch of branchesArray) {
//             var branchAheadCommit = await getAheadCommit(rootUrl, user, repo, branch.name);
//         }
//         var save = {
//             repository: forkRepo,
//             branches: branchesArray
//         }
//         fs.appendFileSync('res.json', JSON.stringify(save));
//         break;
//     }
// });