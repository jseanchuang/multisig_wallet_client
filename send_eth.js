const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const FULLNODE_JSON_RPC_URL = 'https://ropsten.infura.io/XCC2CYVBH44ESYGFNAI7ZF7S6YN6KSXWET';
const web3 = new Web3(new Web3.providers.HttpProvider(FULLNODE_JSON_RPC_URL));

const SENDER_ADDR = process.env['SENDER_ADDRESS'];
const SENDER_PK = new Buffer.from(process.env['SENDER_PRIVATE_KEY'], 'hex');
const RECEIVER_ADDR = '0x3b8e71aF45Cdb0DBfd93Bdf5A129aa0eC12cd362';

const check_balance = async (address) => {
    return await web3.eth.getBalance(address);
}

const queryTransactionCount = async (address) => {
    return await web3.eth.getTransactionCount(address);
};

const sendSignedTransaction = (tx) => {
	const receipt = web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
		.on('error', function(error){
				console.log("-> error")
				console.log(error.message)
		})
		.on('transactionHash', function(transactionHash){
				console.log("-> transactionHash")
				console.log(transactionHash)

		})
		.on('receipt', function(receipt){
				console.log("-> receipt")
				console.log(receipt) // contains the new contract address
		})
}

const send_eth = async (dest, value) => {
    const val = web3.utils.toWei('' + value, "ether");
    const balance = new BigNumber(await check_balance(SENDER_ADDR));
    if (balance.isLessThan(new BigNumber(val))) throw Error('Insufficient balance')
    
    const count = await queryTransactionCount(SENDER_ADDR);
    var rawTx = {
		from: SENDER_ADDR,
		nonce: web3.utils.toHex(count),
		gasPrice: web3.utils.toHex(10 * 1e9),
		to: dest,
        value: web3.utils.toHex(val),
	};

	let egas = await web3.eth.estimateGas(rawTx);
    rawTx.gasLimit = web3.utils.toHex(egas);
    console.log(rawTx);

	var tx = new Tx(rawTx);
	tx.sign(SENDER_PK);

	console.log('start to send....')
	sendSignedTransaction(tx)
}


(async () => {
    /** send eth */
    await send_eth(RECEIVER_ADDR, 0.1)

})().catch((e) => {
    console.error('');
    console.error(e);
    console.error('process terminated');
    process.exit(1);
});