const assert = require('assert');
const ganache = require('ganache-cli');
const { beforeEach, describe, it } = require('mocha');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const {abi, evm} = require('../compile');


let lottery;
let accounts;

beforeEach(async() =>{
//Get list of accounts
    accounts = await web3.eth.getAccounts();
//Use one account to depoloy contract    
    lottery = await new web3.eth.Contract(abi)
        .deploy({data: evm.bytecode.object})
        .send({from:accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () =>{
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('Allows entry into lottery', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('Allows multiple entrants into lottery', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum amount of ether to enter', async() => {
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: '1'
            });
            //should not reach below
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('only manager can call pickWinner', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        try{
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            //should not reach below
            assert(false);
        } catch(err) {
            assert(err);
        }
    });

    it('Picking winner sends money, resets players array, and resets contract balance', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        //Check that entrant balance increased after winning
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance
        assert(difference > web3.utils.toWei('1.8','ether'));

        //Check that players reset
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(0, players.length);

        //Check that contract balance reset
        const contractBalance = await web3.eth.getBalance(lottery.options.address);
        assert.equal(0, contractBalance);

    });



});