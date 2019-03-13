const abi = require('./multisig_abis.json')
const erc20_abi = require('./erc20_abi.json')
const Tx = require('ethereumjs-tx');
const Web3 = require('web3');

const FULLNODE_JSON_RPC_URL = 'https://ropsten.infura.io/';
const web3 = new Web3(new Web3.providers.HttpProvider(FULLNODE_JSON_RPC_URL));

const MULTISIG_WALLET_ADDR = '0x6a7e5f6ec5c8584502bf7bd2f1c5009fe8a34064'
const TOKEN_ADDRESS = '0x722dd3F80BAC40c951b51BdD28Dd19d435762180';  // Ropsten TST Token

const OWNER1_ADDR = process.env['OWNER_ADDRESS_1'];
const OWNER1_PK = new Buffer.from(process.env['OWNER_PK_1'], 'hex');

const OWNER2_ADDR = process.env['OWNER_ADDRESS_2'];
const OWNER2_PK = new Buffer.from(process.env['OWNER_PK_2'], 'hex');

const DEST_ADDR = '0xdA5Fc06E1Bd155B4C607b7e30061c01700424389'

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


const submitTransaction = async (dest, value, data) => {    
    const wallet = new web3.eth.Contract(abi.multiSigDailyLimit.abi, MULTISIG_WALLET_ADDR);
    const count = await queryTransactionCount(OWNER1_ADDR);
    var data = wallet.methods.submitTransaction(dest, web3.utils.toWei(value, 'ether'), Buffer.from(data, 'hex')).encodeABI();

    var rawTx = {
			from: OWNER1_ADDR,
			nonce: web3.utils.toHex(count),
			gasPrice: web3.utils.toHex(10 * 1e9),
			to: MULTISIG_WALLET_ADDR,
			data: data,
		};
		console.log('rawTx: ', rawTx);
		let egas = await web3.eth.estimateGas(rawTx);
		rawTx.gasLimit = web3.utils.toHex(egas);
		var tx = new Tx(rawTx);
		tx.sign(OWNER1_PK);

		console.log('start to send....')
		sendSignedTransaction(tx)
}

const revokeConfirmation = async (txid) => {
	const wallet = new web3.eth.Contract(abi.multiSigDailyLimit.abi, MULTISIG_WALLET_ADDR);
    const count = await queryTransactionCount(OWNER1_ADDR);
    var data = wallet.methods.revokeConfirmation(txid).encodeABI();

    var rawTx = {
			from: OWNER1_ADDR,
			nonce: web3.utils.toHex(count),
			gasPrice: web3.utils.toHex(10 * 1e9),
			to: MULTISIG_WALLET_ADDR,
			data: data,
		};
		console.log('rawTx: ', rawTx);
		let egas = await web3.eth.estimateGas(rawTx);
		rawTx.gasLimit = web3.utils.toHex(egas);
		var tx = new Tx(rawTx);
		tx.sign(OWNER1_PK);

		console.log('start to send....')
		sendSignedTransaction(tx)
}

const confirmTransaction = async (txid) => {
    
	const wallet = new web3.eth.Contract(abi.multiSigDailyLimit.abi, MULTISIG_WALLET_ADDR);

	const count = await queryTransactionCount(OWNER2_ADDR);
	var data = wallet.methods.confirmTransaction(txid).encodeABI();

	var rawTx = {
		from: OWNER2_ADDR,
		nonce: web3.utils.toHex(count),
		gasPrice: web3.utils.toHex(10 * 1e9),
		to: MULTISIG_WALLET_ADDR,
		data: data,
	};

	let egas = await web3.eth.estimateGas(rawTx);
	rawTx.gasLimit = web3.utils.toHex(egas);

	var tx = new Tx(rawTx);
	tx.sign(OWNER2_PK);

	console.log('start to send....')
	sendSignedTransaction(tx)
}

const getTransactionCount = async (pending, executed) => {
	const wallet = new web3.eth.Contract(abi.multiSigDailyLimit.abi, MULTISIG_WALLET_ADDR);
	var res = await wallet.methods.getTransactionCount(pending, executed).call();
	console.log(res);
}

const getTransactions = async (index) => {
	const wallet = new web3.eth.Contract(abi.multiSigDailyLimit.abi, MULTISIG_WALLET_ADDR);
	var res = await wallet.methods.transactions(index).call();
	console.log(res);
}


const generateErc20TransferData = async (dest, value) => {
	const erc20 = new web3.eth.Contract(erc20_abi, TOKEN_ADDRESS);
	const dec = await erc20.methods.decimals().call();
	var amount = web3.utils.toHex(value * Math.pow(10, dec));
	const data = erc20.methods.transfer(dest, amount).encodeABI();
	return data;
}


(async () => {
	/** Invoke contract */
	// Submit ETH withdraw transaction
	// await submitTransaction(DEST_ADDR, '0.01', '');
	
	// Submit ERC20 withdraw transaction
	// const data = await generateErc20TransferData(OWNER2_ADDR, 0.01);
	// await submitTransaction(TOKEN_ADDRESS, '0', data.slice(2, data.length));

	// await confirmTransaction(4);

	// await revokeConfirmation(3);

	/** Read contract */
	// await getTransactionCount(true, false)

	// await getTransactions(3);



})().catch((e) => {
    console.error('');
    console.error(e);
    console.error('process terminated');
    process.exit(1);
});

