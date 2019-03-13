const abi = require('./multisig_abis.json')
const Tx = require('ethereumjs-tx');
const Web3 = require('web3');

const FULLNODE_JSON_RPC_URL = 'https://ropsten.infura.io/XCC2CYVBH44ESYGFNAI7ZF7S6YN6KSXWET';
const web3 = new Web3(new Web3.providers.HttpProvider(FULLNODE_JSON_RPC_URL));

/**
 * Multisig-factor address
 * Mainnet:
 * Ropsten:    0x5cb85db3e237cac78cbb3fd63e84488cac5bd3dd
 * Rinkeby:    0x19ba60816abca236baa096105df09260a4791418
 */

const sender_address = process.env['SENDER_ADDRESS'];
const sender_pk = new Buffer.from(process.env['SENDER_PRIVATE_KEY'], 'hex');
const factory_contract_addree = '0x5cb85db3e237cac78cbb3fd63e84488cac5bd3dd'
const owner1 = process.env['OWNER_ADDRESS_1'];
const owner2 = process.env['OWNER_ADDRESS_2'];
const owner3 = process.env['OWNER_ADDRESS_3'];


const queryTransactionCount = async (address) => {
    return await web3.eth.getTransactionCount(address);
};

const main = async () => {
    
    const factory = new web3.eth.Contract(abi.multiSigDailyLimitFactory.abi, factory_contract_addree);

    const data = factory.methods.create([owner1, owner2, owner3], 2, 0).encodeABI();

    const count = await queryTransactionCount(sender_address);
    console.log('count: ', count);

    var rawTx = {
			from: sender_address,
			nonce: web3.utils.toHex(count),
			gasPrice: web3.utils.toHex(10 * 1e9),
			to: factory_contract_addree,
			value: '0x00',
			data: data,
    };
    
    let egas = await web3.eth.estimateGas(rawTx);
    rawTx.gasLimit = web3.utils.toHex(egas);

    console.log(rawTx);

    var tx = new Tx(rawTx);
    tx.sign(sender_pk);
    
    console.log('start to send....')
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

    console.log('finish')

}



(async () => {
    await main();
})().catch((e) => {
    console.error('');
    console.error(e);
    console.error('process terminated');
    process.exit(1);
});

