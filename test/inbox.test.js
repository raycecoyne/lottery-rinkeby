const assert = require('assert');
const ganache = require('ganache-cli');
const { beforeEach, describe, it } = require('mocha');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {abi, evm} = require('../compile');

let accounts;
let inbox;
const initialMessage = 'Hi There!'

beforeEach(async ()=>{
//Get list of accounts
    accounts = await web3.eth.getAccounts();
//Use one account to depoloy contract    
    inbox = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object, arguments:[initialMessage]})
        .send({from:accounts[0], gas:'1000000'});
});

describe('Inbox',()=>{
    it('deploys a contract', ()=>{
        assert.ok(inbox.options.address);
    });
    it('has a default message', async ()=>{
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, initialMessage);
    })
    it('modifies message', async ()=>{
        const newMessage = 'New Message';
        await inbox.methods.setMessage(newMessage).send({from: accounts[0]});
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, newMessage);
    })
});