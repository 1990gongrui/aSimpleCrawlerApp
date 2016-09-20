var crewler_entry = require('./crewler');

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Input target address pls:', (answer) => {
  crewler_entry.crewler(answer);
  rl.close();
});