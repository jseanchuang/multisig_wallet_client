# Instructions to create a client in Trader App

## Step 0. Preprocess
Must prepare a account with sufficient ETH/ERC20 to do the following transaction.

## Step 1. 
Generate key paris for each role.
```
node gen_hd_wallet.js
```

## Step 2. Generate Gnosis multiSig wallet for OP1 ~ OP3
```
node wallet_factory.js
```

## Step 3. Transfer ETH to OP1~OP3 and MultiSig wallet
```
node send_eth.js
```

## Step 4. Transfer ERC20 to MultiSig Wallet
```
node erc20.js
```

# Gnosis MultiSig Wallet interaction
```
node multisig_wallet.js
```