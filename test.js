var request = require('request');
require('dotenv').config();
var fs = require('fs');
const { Main2 } = require('./src/app/core/Main2');
const { resolve } = require('path');
const { rejects } = require('assert');

var main = new Main2("https://api.github.com/repos/moonlight-stream/moonlight-embedded");

main.run();

// var fullName = "moonlight-stream/moonlight-embedded";
// var defaultBranch = "master";
// var branchList = [
//     {
//     "name": "alsa_mapping",
//     "commit": {
//       "sha": "72985ee71d2a5643aef0d2ac3c31316c0b96a4b5",
//       "url": "https://api.github.com/repos/moonlight-stream/moonlight-embedded/commits/72985ee71d2a5643aef0d2ac3c31316c0b96a4b5"
//     },
//     "protected": false
//   },
//   {
//     "name": "master",
//     "commit": {
//       "sha": "b9703e7a1e17ad36d0848c5e8b6bc6c4993abc37",
//       "url": "https://api.github.com/repos/moonlight-stream/moonlight-embedded/commits/b9703e7a1e17ad36d0848c5e8b6bc6c4993abc37"
//     },
//     "protected": false
//   },
//   {
//     "name": "pkgconf",
//     "commit": {
//       "sha": "634a0eee15ed636e1dfcd198911f805ea5700465",
//       "url": "https://api.github.com/repos/moonlight-stream/moonlight-embedded/commits/634a0eee15ed636e1dfcd198911f805ea5700465"
//     },
//     "protected": false
//   },
//   {
//     "name": "raspbian/jessie",
//     "commit": {
//       "sha": "c75fbeeb811bf4357fe33f3556563a9149bf442a",
//       "url": "https://api.github.com/repos/moonlight-stream/moonlight-embedded/commits/c75fbeeb811bf4357fe33f3556563a9149bf442a"
//     },
//     "protected": false
//   },
//   {
//     "name": "raspbian/stretch",
//     "commit": {
//       "sha": "31f9555699f93d76046f666825a00079c64ae98d",
//       "url": "https://api.github.com/repos/moonlight-stream/moonlight-embedded/commits/31f9555699f93d76046f666825a00079c64ae98d"
//     },
//     "protected": false
//   },
//   {
//     "name": "raspbian/wheezy",
//     "commit": {
//       "sha": "538a3eadc32505e5f50884d7708240c12064f192",
//       "url": "https://api.github.com/repos/moonlight-stream/moonlight-embedded/commits/538a3eadc32505e5f50884d7708240c12064f192"
//     },
//     "protected": false
//   },
//   {
//     "name": "v1.x",
//     "commit": {
//       "sha": "b1ea69e2dda507c911d3787c7081d85e02c24af0",
//       "url": "https://api.github.com/repos/moonlight-stream/moonlight-embedded/commits/b1ea69e2dda507c911d3787c7081d85e02c24af0"
//     },
//     "protected": false
//   }
// ]
// var compareUser = "scoobyd00";
// var compareRepo = "moonlight-embedded";
// var compareBranchList = [
//     {
//         "name": "master",
//         "commit": {
//           "sha": "41a10d7234640a87dfb3f4ebb221175ff6efbe94",
//           "url": "https://api.github.com/repos/scoobyd00/moonlight-embedded/commits/41a10d7234640a87dfb3f4ebb221175ff6efbe94"
//         },
//         "protected": false
//       },
//       {
//         "name": "moonlight-raspbian",
//         "commit": {
//           "sha": "ddcea3c499817efeb6e864bdd156309c7f92be31",
//           "url": "https://api.github.com/repos/scoobyd00/moonlight-embedded/commits/ddcea3c499817efeb6e864bdd156309c7f92be31"
//         },
//         "protected": false
//       },
//       {
//         "name": "v1.x",
//         "commit": {
//           "sha": "b1ea69e2dda507c911d3787c7081d85e02c24af0",
//           "url": "https://api.github.com/repos/scoobyd00/moonlight-embedded/commits/b1ea69e2dda507c911d3787c7081d85e02c24af0"
//         },
//         "protected": false
//       }
// ]

// main.compareRepository(fullName, defaultBranch, branchList, compareUser, compareRepo, compareBranchList,
//     (data) => fs.writeFileSync('testFile.json', JSON.stringify(data)));