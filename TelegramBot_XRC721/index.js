const { Web3 } = require('web3');
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { NFTStorage, File } = require('nft.storage');
const axios = require('axios');
const {abi} = require('./abi.js')
const { ethers } = require('ethers');
require('dotenv/config');

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

bot.onText(/\/mint/, (msg) => {
  const chatId = msg.chat.id;

  const keyboard = [
    [{ text: 'Mint NFT', callback_data: 'zora' }],
  ];

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };

  bot.sendMessage(chatId, 'Please choose an option:', replyMarkup);
});



async function main() {
  
  bot.onText(/\/start/, (msg) => {
    chatId = msg.chat.id;
    console.log();
    bot.sendMessage(chatId, `Hello ${msg.from.first_name}, welcome to XDC bot`);
  });

  bot.onText(/\/rich/, (msg) => {
    chatId = msg.chat.id;
    bot.sendMessage(chatId, "Hold my beer");
  });

  app.listen(port, () => {
    console.log(`Bot started on ${port}`);
  });
}

main();


