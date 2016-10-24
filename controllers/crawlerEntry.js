var crawler_entry = require('../models/crawler');

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Input target address pls:', (answer) => {
  crawler_entry.crawler(answer);
  rl.close();
});
