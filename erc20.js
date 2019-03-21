

const abi = require('./erc20_abi.json')
const Tx = require('ethereumjs-tx');
const Web3 = require('web3');

const FULLNODE_JSON_RPC_URL = 'https://ropsten.infura.io/XCC2CYVBH44ESYGFNAI7ZF7S6YN6KSXWET';
const web3 = new Web3(new Web3.providers.HttpProvider(FULLNODE_JSON_RPC_URL));


const TOKEN_ADDRESS = '0x722dd3F80BAC40c951b51BdD28Dd19d435762180';  // Ropsten TST Token

const SENDER_ADDR = process.env['SENDER_ADDRESS'];
const SENDER_PK = new Buffer.from(process.env['SENDER_PRIVATE_KEY'], 'hex');
const RECEIVER = '0x3b8e71aF45Cdb0DBfd93Bdf5A129aa0eC12cd362';

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

const transfer = async (dest, value) => {
    const erc20 = new web3.eth.Contract(abi, TOKEN_ADDRESS);
    const dec = await decimals(TOKEN_ADDRESS);
    var amount = web3.utils.toHex(value * Math.pow(10, dec));
    const data = erc20.methods.transfer(dest, amount).encodeABI();
    const count = await queryTransactionCount(SENDER_ADDR);
    var rawTx = {
		from: SENDER_ADDR,
		nonce: web3.utils.toHex(count),
		gasPrice: web3.utils.toHex(10 * 1e9),
		to: TOKEN_ADDRESS,
		data: data,
	};

	let egas = await web3.eth.estimateGas(rawTx);
    rawTx.gasLimit = web3.utils.toHex(egas);
    console.log(rawTx);
    // return

	var tx = new Tx(rawTx);
	tx.sign(SENDER_PK);

	console.log('start to send....')
	sendSignedTransaction(tx)
}

const balanceOf = async (address) => {   
    const erc20 = new web3.eth.Contract(abi, TOKEN_ADDRESS);
    const res = await erc20.methods.balanceOf(address).call();
    console.log(res);
}

const decimals = async () => {
    const erc20 = new web3.eth.Contract(abi, TOKEN_ADDRESS);
    const decimals = await erc20.methods.decimals().call();
    return decimals;
}



(async () => {
    /** Invoke contract */
    await transfer(RECEIVER, 1)

    /** Read contract */
    // await balanceOf(SENDER_ADDR);
})().catch((e) => {
    console.error('');
    console.error(e);
    console.error('process terminated');
    process.exit(1);
});

