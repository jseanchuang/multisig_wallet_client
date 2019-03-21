const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

/**
 * BIP-32   Hierarchical Deterministic Wallets
 * https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * 
 * BIP-39   Mnemonic code for generating deterministic keys
 * https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * 
 * BIP-44   Multi-Account Hierarchy for Deterministic Wallets
 * https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 *      m / purpose' / coin_type' / account' / change / address_index
 * 
 *      Coin types
 *      https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 * 
 * Reference:
 *  1. https://iancoleman.io/bip39/
 *  2. https://www.mobilefish.com/download/ethereum/hd_wallet.html
 * 
 */

function main() {
    // Generate 12 mnemonic words
    const mnemonic = bip39.generateMnemonic(256);
    // BIP-39 seed (Hex, 512 bits):
    const seed = bip39.mnemonicToSeedHex(mnemonic);

    const key = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
    const res = {
        mnemonic: mnemonic,
        hexseed: seed,
        root_extended_private_key: key.privateExtendedKey(),
        root_extended_public_key: key.publicExtendedKey(),
        child_wallets: []
    };
    
    /**
     * Generate BTC address by given derive path
     */
    const derivePath = "m/44'/0'/0'/0/0";
    const wallet = key.derivePath(derivePath).getWallet();
    let child = {
        derivePath: derivePath,
        address: wallet.getChecksumAddressString(),
        private_key: wallet.getPrivateKeyString(),
        public_key: wallet.getPublicKeyString(),
     };
     res.child_wallets.push(child)
    
    console.log(res);
    
}

main()