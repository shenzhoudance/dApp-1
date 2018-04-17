Deployment

* To correctly compile dependencies you will need to deploy from an EC2 instance [That matches the Lambda Execution Environment](https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html)
* Set Environment variables PROVIDER_URL, CONTRACT_ADDRESS, OWNER_ADDRESS and OWNER_PRIVKEY in serverless.yml
* node >= v8.1.0
* `npm install`
* `npm install -g serverless`
* `serverless deploy`

HTTP methods

* POST /whitelist '{"address": "0xblala"}' - Adds an address to DynamoDB and submits transaction `addAddressToWhiteList` to `MarketContractRegistry.sol`
* GET /whitelist - Returns addresses in `addressWhiteList` from `MarketContractRegistry.sol`
* GET /dbentries - Returns all addresses submitted to DynamoDB
