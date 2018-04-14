'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: process.env.DYNAMODB_TABLE,
};

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
const ABI = [{"constant":false,"inputs":[{"name":"contractAddress","type":"address"}],"name":"addAddressToWhiteList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"contractAddress","type":"address"}],"name":"AddressAddedToWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"contractAddress","type":"address"}],"name":"AddressRemovedFromWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":false,"inputs":[{"name":"contractAddress","type":"address"},{"name":"whiteListIndex","type":"uint256"}],"name":"removeContractFromWhiteList","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAddressWhiteList","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"contractAddress","type":"address"}],"name":"isAddressWhiteListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}];
const registry = new web3.eth.Contract(ABI, process.env.CONTRACT_ADDRESS);

module.exports.getdbentries = async (event, context) => {

  return await new Promise((resolve, reject) => {
    dynamoDb.scan(params, (error, result) => {
      if (error) {
        reject({
          statusCode: 502,
          headers: { 'Content-Type': 'text/plain' },
          body: message || 'Scan Failed',
        })
      }
      else {
        resolve({
          statusCode: 200,
          body: JSON.stringify(result.Items),
        });
      }
    })
  })
};

module.exports.getwhitelist = async (event, context) => {
  return await new Promise((resolve, reject) => {
    registry.methods.getAddressWhiteList().call((err, res) =>{
      if(err){
        reject({
          statusCode: 502,
          headers: { 'Content-Type': 'text/plain' },
          body: message || 'Transaction Failed',
        })
      }
      if(res){
        resolve({
          statusCode: 200,
          body: JSON.stringify(res),
        })
      }
    })
  })
};