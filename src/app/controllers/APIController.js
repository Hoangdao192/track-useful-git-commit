const request = require('request');
const config = require('../config');

class APIController {
    
    listRepositoryBranches(req, res) {
        var repositoryFullName = req.query.repositoryFullName;
        var apiUrl = `https://api.github.com/repos/${repositoryFullName}/branches`;
        console.log(apiUrl);
        var options = {
            url: apiUrl,
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.0',
                'Authorization': `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`
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
                'Authorization': `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        }
        request(options, (err, result, body) => {
            res.send(body);
        })
    }
}

module.exports = new APIController();