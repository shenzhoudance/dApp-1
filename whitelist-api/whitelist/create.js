'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
const ABI = [{"constant":false,"inputs":[{"name":"contractAddress","type":"address"}],"name":"addAddressToWhiteList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"contractAddress","type":"address"}],"name":"AddressAddedToWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"contractAddress","type":"address"}],"name":"AddressRemovedFromWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":false,"inputs":[{"name":"contractAddress","type":"address"},{"name":"whiteListIndex","type":"uint256"}],"name":"removeContractFromWhiteList","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAddressWhiteList","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"contractAddress","type":"address"}],"name":"isAddressWhiteListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}];
const registry = new web3.eth.Contract(ABI, process.env.CONTRACT_ADDRESS);
const account = web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PRIVKEY);

module.exports.create = async function (event, context) {

  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  if (typeof data.address !== 'string') {
    console.error('Validation Failed');
    throw new Error(error);
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      address: data.address,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  const method = registry.methods.addAddressToWhiteList(data.address); 
  const tx = {
    from: process.env.OWNER_ADDRESS,
    to: process.env.CONTRACT_ADDRESS,
    gas: process.env.GAS_LIMIT,
    gasPrice: process.env.GAS_PRICE,
    data: method.encodeABI(),
  }



  function addToDatabase(){
    return new Promise((resolve, reject) => {
      dynamoDb.put(params, (error) => {
        if(error) {
          reject({
            statusCode: 502,
            headers: { 'Content-Type': 'text/plain' },
            body: message || 'Database Put Failed',
          })
        }
        else {
          resolve({ statusCode: 200, body: "Address: " + data.address})
        }
      })
    }) 
  }

  function sendTx(){
    return new Promise((resolve, reject) => {
      web3.eth.accounts.signTransaction(tx, process.env.OWNER_PRIVKEY, (error, resource) =>
      {
        if(error) {
          reject({
            statusCode: 502,
            headers: { 'Content-Type': 'text/plain' },
            body: message || 'Sign Transaction Failed',
          })
        }
        if(resource){
          {
            web3.eth.sendSignedTransaction(resource.rawTransaction, (err, res) =>{
              if (err){
                reject({
                  statusCode: 502,
                  headers: { 'Content-Type': 'text/plain' },
                  body: message || 'Transaction Failed',
                })
              
              }
              if (res){
                resolve({ statusCode: 200, body: "txHash: " + res})
              }
            })
          }
        }
      });
    })
  }
  return new Promise(async (resolve, reject) => {
    try{
      await Promise.all([addToDatabase,sendTx])
      resolve({ statusCode: 200, body: "SUCCESS"});
    } catch(error) {
      reject(error)
    }
  });
};
