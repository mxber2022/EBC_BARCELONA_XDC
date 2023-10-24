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
              [{ text: 'NFT Gallery Viewing', callback_data: 'gallery_viewing' }],
              [{ text: 'Trading Alert', callback_data: 'trading_alert' }],
              [{ text: 'NFT Minting', callback_data: 'nft_minting' }],
              [{ text: 'Monitor Address', callback_data: 'monitor' }],
              [{ text: 'TIP', callback_data: 'tip' }]
          ]
      }
    };

    bot.sendMessage(chatId, 'Please choose an option:', options);
    });

  bot.onText(/\/rich/, (msg) => {
    chatId = msg.chat.id;
    bot.sendMessage(chatId, "Hold my beer");
    monitor()
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
    2. Price Alerts: The bot will notify them when the NFT reaches that price.
  */


  /*
    3. Generate Wallet: The bot will generate wallet as per the user name.
  */

  
  /* 
    4. Monitor activity on a blockchain address
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