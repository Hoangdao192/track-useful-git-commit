const request = require('request');
const { JSDOM } = require('jsdom');
const { Octokit } = require("@octokit/core");
const express = require('express');
const { append } = require('express/lib/response');
const fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');

var url = "https://github.com/moonlight-stream/moonlight-embedded/network/members";
var linkRepo = "https://github.com/Gymnae/moonlight-switch";

console.log(generateApiUrlFromGithubUrl(linkRepo));

function generateApiUrlFromGithubUrl(url) {
    url = slashTrim(url);
    var urlRoutes = url.split('/');
    var apiUrl = `https://api.github.com/repos/${urlRoutes[3]}/${urlRoutes[4]}`;
    return apiUrl;
}

function slashTrim(url) {
    while (url[0] == '/' || url[0] == "\\") {
        url = url.slice(1, url.length);
    }

    while (url[url.length - 1] == '/' || url[url.length - 1] == '\\') {
        url = url.slice(0, url.length - 1);
    }

    return url;
}

var apiUrl = generateApiUrlFromGithubUrl(linkRepo);
function getRootRepository(repoApiUrl, callback) {
    request({
        url: repoApiUrl,
        headers: {
            'User-Agent': 'PostmanRuntime/7.29.0',
            'Authorization': 'token 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'
        }
    },
        (err, res, body) => {
            var result = JSON.parse(body);
            if (result.fork == false) {
                callback(result.url);
            } else {
                getRootRepository(result.parent.url, callback);
            }
        })
}

function loadFork(forkArray, apiUrl, page) {
    if (forkArray.length != 0) {
        console.log(apiUrl + ": " + forkArray.length);
        for (var forkRepo of forkArray) {
            fs.appendFileSync('fork_list.txt', forkRepo.url + "\n");
            if (forkRepo.forks_count != 0) {
                getAllForkRepository(forkRepo.url);
            }
        }
        getForkPerPage(apiUrl, page + 1, loadFork);
    }
}

function getAllForkRepository(apiUrl) {
    var page = 1;
    getForkPerPage(apiUrl, page, loadFork);
}

function getForkPerPagePromise(apiUrl, page) {
    return new Promise((resolve, rejects) => {
        var forkListUrl = apiUrl + `/forks?per_page=100&page=${page}`;
        console.log(forkListUrl);
        var options = {
            url: forkListUrl,
            headers: {
                'User-Agent': 'Chrome',
                'Authorization': 'token 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'
            }
        };
        request(options, (err, res, body) => {
            var forkArray = JSON.parse(body);
            resolve(forkArray, apiUrl, page);
        })
    })
}

function getForkPerPage(apiUrl, page, callback) {
            var forkListUrl = apiUrl + `/forks?per_page=100&page=${page}`;
            console.log(forkListUrl);
            var options = {
                url: forkListUrl,
                headers: {
                    'User-Agent': 'Chrome',
                    'Authorization': 'token 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'
                }
            };

            request(options, (err, res, body) => {
                var forkArray = JSON.parse(body);
                callback(forkArray, apiUrl, page);
            })
        }

getRootRepository(apiUrl, (root) => {
            console.log(root);
            getAllForkRepository(root);
        })


