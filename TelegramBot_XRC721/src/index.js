const { Web3 } = require('web3');
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { NFTStorage, File } = require('nft.storage');
const axios = require('axios');
const {abi} = require('./abi.js')
const { ethers } = require('ethers');
//require('dotenv/config');
require('dotenv').config({path: '/Users/maharajababu/Documents/Projects/EBC_BARCELONA_XDC/TelegramBot_XRC721/.env'})
const { TatumSDK, Xdc, Network, XinFin } = require('@tatumio/tatum');
const { EvmWalletProvider } = require("@tatumio/evm-wallet-provider");

const app = express();
const port = "8080";
app.use(bodyParser.json());

const rpc_url = "https://erpc.apothem.network"; 
const web3 = new Web3(rpc_url);

const botToken = process.env.BotToken;
const bot = new TelegramBot(botToken, { polling: true });
let chatId;


const userState = {};
let CHAIN;


async function main() {
  
  bot.onText(/\/start/, (msg) => {
    chatId = msg.chat.id;
    bot.sendMessage(chatId, `Hello ${msg.from.first_name}, welcome to XDC bot`);

    const options = {
      reply_markup: {
          inline_keyboard: [
              [{ text: 'Generate Wallet', callback_data: 'walletcreation' }],
              [{ text: 'TIP', callback_data: 'tip' }],
              [{ text: 'AccountBalance', callback_data: 'Balance' }],
              [{ text: 'NFT Gallery Viewing', callback_data: 'gallery_viewing' }],
              [{ text: 'Trading Alert', callback_data: 'trading_alert' }],
              [{ text: 'NFT Minting', callback_data: 'nft_minting' }],
              [{ text: 'Monitor Address', callback_data: 'monitor' }]
              
          ]
      }
    };

    bot.sendMessage(chatId, 'Please choose an option:', options);
    });

  bot.onText(/\/rich/, (msg) => {
    chatId = msg.chat.id;
    bot.sendMessage(chatId, "Hold my beer");
  });

  app.listen(port, () => {
    console.log(`Bot started on ${port}`);
  });


  /* 
    1. Trading Alert (https://primeport.xyz/): Give alter when someone trade the nft.
  */

  const userSteps = {};
  
  bot.onText(/\/tradealert/, (msg) => {
    const chatId = msg.chat.id;

    // Ask for the contract address
    bot.sendMessage(chatId, "Please provide the NFT contract address.");

    // Set the user's current step
    userSteps[chatId] = 'awaiting_contract_address';
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (userSteps[chatId] === 'awaiting_contract_address') {
        // Store the contract address temporarily
        userSteps[chatId] = {
            step: 'awaiting_token_id',
            contract_address: msg.text
        };
        
        // Ask for the token ID
        bot.sendMessage(chatId, "Great! Now, please provide the Token ID for the NFT.");
    } 
    else if (userSteps[chatId] && userSteps[chatId].step === 'awaiting_token_id') {
        const contractAddress = userSteps[chatId].contract_address;
        const tokenId = msg.text;

        // Store the alert in the database
        /*database.insert({
            telegram_id: chatId,
            nft_contract_address: contractAddress,
            nft_token_id: tokenId
        });
*/
        // Clear the user's step
        delete userSteps[chatId];

        bot.sendMessage(chatId, `You'll be alerted when NFT with Token ID ${tokenId} at contract ${contractAddress} is traded.`);
    }
  });



  /*
    2. Tip : The bot will tip money as per user preference.
  */



  /*
    3. Price Alerts: The bot will notify them when the NFT reaches that price.
  */


  /*
    4. Generate Wallet: The bot will generate wallet as per the user name.
  */

  
  
  /* 
    5. Monitor activity on a blockchain address
  */


}

main();





async function monitor() {
    const tatum = await TatumSDK.init({ network: Network.XDC});
    const monitoredAddress = 'xdc13bc7ffde90a5dff3c180938acb463a19715b605';
    /* 
    const subscription = await tatum.notification.subscribe.incomingNativeTx({
        address: monitoredAddress,
        url: 'http://0.0.0.0:3000' // replace with your handler URL
    });
    console.log(`Now you are subscribed for all incoming ETH transactions on ${monitoredAddress}`);
    console.log(subscription);

    */
}

/* 
  1. Wallet Creation
*/
bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const TID = chatId;
  if (action === 'walletcreation') {
      // Handle gallery viewing
      bot.sendMessage(chatId, 'Please wait while your wallet is generated');
      const public_key = await createWallet(TID);

      console.log("public_key: ", public_key);
      bot.sendMessage(chatId, public_key);
  } 
});

async function createWallet(TID) {
  
  //send request to mongo db server
 console.log("TID: ", TID);
  const response = await fetch("http://localhost:8006/generateWallet", {
    method: "POST",
    headers: {
        "Content-Type" : "application/json"
    },
    body: JSON.stringify({
      TID
    })
  });
  const responseData = await response.json();
  console.log("response:", responseData);
  
  return responseData;
}

/* 
  2. Tip
*/

let awaitingTipAmount = {};
let awaitingWalletAddress = {};

let tipAmount = 0;
let wallet_Address = 0;

bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;

  if (action === 'tip') {
      bot.sendMessage(chatId, "How much would you like to tip?");
      awaitingTipAmount[chatId] = true; // Set flag to true indicating we're waiting for this user's tip amount
      
      
  } 
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (awaitingTipAmount[chatId]) {
      bot.sendMessage(chatId, "Please provide your wallet address.");
      awaitingWalletAddress[chatId] = true; // Set flag to true indicating we're waiting for this user's wallet address  
      tipAmount = msg.text;
      //console.log("tipAmount: ", tipAmount);
      
      delete awaitingTipAmount[chatId]; // Reset the flag for tip amount
  } else if (awaitingWalletAddress[chatId]) {
      /*
        Send The TIP Logic 
      */
        wallet_Address=msg.text;
       // console.log("wallet_Address: ", wallet_Address);
      const tip_status = await tip_user(chatId, tipAmount, wallet_Address);
      bot.sendMessage(chatId, `Transaction_Hash ${tip_status}`);
      delete awaitingWalletAddress[chatId]; // Reset the flag for wallet address
  }
});

async function tip_user(chatId, awaitingTipAmount, awaitingWalletAddress) {

  const TID = chatId;
  const response = await fetch("http://localhost:8006/tip", {
    method: "POST",
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify({
      TID, awaitingTipAmount, awaitingWalletAddress
    })
  });
  
  const responseData = await response.json();
  console.log("response:", responseData);
  return responseData;
}

/* 
  3. Account Balance
*/

let contractAddress = null;
let awaitingAddressFromChatId = null;

bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (action === 'Balance') {
        bot.sendMessage(chatId, "Please send the contract address.");
        awaitingAddressFromChatId = chatId;  // Expecting next message from this chat ID to be the address
    }
});

bot.on('message', async(msg) => {
    const chatId = msg.chat.id;

    if (chatId === awaitingAddressFromChatId) {
        contractAddress = msg.text;  // Store the contract address

        const resp = await fetch(
          `https://api.tatum.io/v3/xdc/account/balance/${contractAddress}`,
          {
            method: 'GET',
            headers: {
              'x-api-key': 't-64f72e260c34f3d88decc5fb-74092a2f68d446018376df01'
            }
          }
        );
      
        const data = await resp.text();
        console.log(data);

        bot.sendMessage(chatId, data);
        awaitingAddressFromChatId = null;
    }
});

/* 
  4. Mointor Transaction
*/
let contract_Address = null;
let awaiting_AddressFromChatId = null;
let lastProcessedBlock = 0;
const testnetProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/xdc_testnet");

bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;

  if (action === 'monitor') {
      bot.sendMessage(chatId, "Please send the contract address.");
      awaiting_AddressFromChatId = chatId;  // Expecting next message from this chat ID to be the address
  }
});

bot.on('message', async(msg) => {
  const chatId = msg.chat.id;

  if (chatId === awaiting_AddressFromChatId) {
    contract_Address = msg.text;  // Store the contract address
    
    setInterval(() => {
      if (contract_Address) {
          monitorContractTransactions(chatId);
      }
  }, 60000);
  }
});

async function monitorContractTransactions(chatId) {
  if (!contract_Address) {
      return;
  }

  const currentBlock = await testnetProvider.getBlockNumber();

  for (let i = lastProcessedBlock + 1; i <= currentBlock; i++) {
      const block = await testnetProvider.getBlockWithTransactions(i);
      block.transactions.forEach(tx => {
          if (tx.to && tx.to.toLowerCase() === contract_Address.toLowerCase()) {
              // Notify the user about the transaction
              bot.sendMessage(chatId, `New transaction to the smart contract: ${tx.hash}`);
          }
      });
  }

  lastProcessedBlock = currentBlock;
}