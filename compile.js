const path = require('path');
const fs = require('fs');
const solc = require('solc');
const CONTRACT_FILE = 'lottery.sol'
const OBJECT_NAME = 'Lottery'

const contractPath = path.resolve(__dirname, 'contracts',CONTRACT_FILE);
const source = fs.readFileSync(contractPath, 'utf-8');

const input = {
    language: 'Solidity',
    sources: {},
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };

  input.sources[CONTRACT_FILE] ={content: source,};
  var output = JSON.parse(solc.compile(JSON.stringify(input)));
  module.exports = output.contracts[CONTRACT_FILE][OBJECT_NAME];
