const Ownable = artifacts.require("zeppelin-solidity/contracts/ownership/Ownable.sol");
const Destructible = artifacts.require("zeppelin-solidity/contracts/lifecycle/Destructible.sol");
const Authentication = artifacts.require("./Authentication.sol");
const QueryTest = artifacts.require("market-solidity/contracts/oraclize/OraclizeQueryTest.sol");

const MathLib = artifacts.require("market-solidity/contracts/libraries/MathLib.sol");
const OrderLib = artifacts.require("market-solidity/contracts/libraries/OrderLib.sol");
const CollateralToken = artifacts.require("market-solidity/contracts/tokens/CollateralToken.sol");
const MarketContractOraclize = artifacts.require("market-solidity/contracts/oraclize/MarketContractOraclize.sol");
const MarketCollateralPool = artifacts.require("market-solidity/contracts/MarketCollateralPool.sol");
const MarketContractRegistry = artifacts.require("market-solidity/contracts/MarketContractRegistry.sol");
const MarketToken = artifacts.require("market-solidity/contracts/tokens/MarketToken.sol");


module.exports = function (deployer, network) {
  if (network !== "live") {
    deployer.deploy(Ownable);
    deployer.link(Ownable, Destructible);
    deployer.deploy(Destructible);
    deployer.link(Destructible, Authentication);
    deployer.deploy(Authentication);


    deployer.deploy(MathLib);
    deployer.deploy(OrderLib);
    deployer.deploy(MarketContractRegistry);

    deployer.link(MathLib, MarketContractOraclize);
    deployer.link(OrderLib, MarketContractOraclize);

    const marketTokenToLockForTrading = 0;    // for testing purposes, require no lock
    const marketTokenAmountForContractCreation = 0;   //for testing purposes require no balance
    const daysToExpiration = 28;
    const marketContractExpiration = Math.floor(Date.now() / 1000) + 86400 * daysToExpiration; // expires in 28 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpiration);
    const expirationString = expirationDate.toISOString().substring(0, 10);

    // deploy primary instance of market contract
    deployer.deploy(
      MarketToken,
      marketTokenToLockForTrading,
      marketTokenAmountForContractCreation
    ).then(function () {
      return deployer.deploy(CollateralToken, "FakeDollars", "FUSD", 1e+9, 18).then(function () {
        let gasLimit = 6100000;  // gas limit for development network
        let block = web3.eth.getBlock("latest");
        if (block.gasLimit > 7000000) {  // coverage network
          gasLimit = block.gasLimit;
        }

        let quickExpirationTimeStamp = Math.floor(Date.now() / 1000) + 60 * 60; // expires in an hour
        return deployer.deploy(
          MarketContractOraclize,
          "ETHUSD_" + new Date().toISOString().substring(0, 10),
          MarketToken.address,
          CollateralToken.address,
          [50000, 150000, 2, 1e+18, quickExpirationTimeStamp],
          "URL",
          "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0",
          600,
          {gas: gasLimit, value: web3.toWei('.1', 'ether'), from: web3.eth.accounts[0]}
        );
      }).then(function () {
        return deployer.deploy(
          MarketCollateralPool,
          MarketContractOraclize.address
        ).then(function () {
          return MarketContractOraclize.deployed();
        }).then(function (instance) {
          return instance.setCollateralPoolContractAddress(MarketCollateralPool.address);
        });
      }).then(function () {
        return MarketContractRegistry.deployed();
      }).then(function (instance) {
        instance.addAddressToWhiteList(MarketContractOraclize.address);
      });
    }).then(async function () {
      // we want to create a few basic contracts to allow users to use the simulated trading experience
      // as well as for testing some of the needed visual elements
      const gasLimit = 6500000;
      await MarketToken.deployed();
      await CollateralToken.deployed();
      let marketContractRegistry = await MarketContractRegistry.deployed();

      let deployedMarketContract = await MarketContractOraclize.new(
        "ETHUSD_" + expirationString,
        MarketToken.address,
        CollateralToken.address,
        [50000, 150000, 2, 1e+18, marketContractExpiration],
        "URL",
        "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0",
        86400,
        {gas: gasLimit, value: web3.toWei('.2', 'ether'), from: web3.eth.accounts[0]}
      );

      let deployedCollateralPool = await MarketCollateralPool.new(
        deployedMarketContract.address
      );
      await deployedMarketContract.setCollateralPoolContractAddress(
        deployedCollateralPool.address
      );
      await marketContractRegistry.addAddressToWhiteList(deployedMarketContract.address);

      deployedMarketContract = await MarketContractOraclize.new(
        "BTCUSD_" + expirationString,
        MarketToken.address,
        CollateralToken.address,
        [500000, 2000000, 2, 1e+18, marketContractExpiration],
        "URL",
        "json(https://api.kraken.com/0/public/Ticker?pair=XBTUSD).result.XXBTZUSD.c.0",
        86400,
        {gas: gasLimit, value: web3.toWei('.3', 'ether'), from: web3.eth.accounts[0]}
      );

      deployedCollateralPool = await MarketCollateralPool.new(
        deployedMarketContract.address
      );
      await deployedMarketContract.setCollateralPoolContractAddress(
        deployedCollateralPool.address
      );
      await marketContractRegistry.addAddressToWhiteList(deployedMarketContract.address);

      deployedMarketContract = await MarketContractOraclize.new(
        "LTCUSD_" + expirationString,
        MarketToken.address,
        CollateralToken.address,
        [7500, 20000, 2, 1e+18, marketContractExpiration],
        "URL",
        "json(https://api.kraken.com/0/public/Ticker?pair=LTCUSD).result.XLTCZUSD.c.0",
        86400,
        {gas: gasLimit, value: web3.toWei('.3', 'ether'), from: web3.eth.accounts[0]}
      );

      deployedCollateralPool = await MarketCollateralPool.new(
        deployedMarketContract.address
      );
      await deployedMarketContract.setCollateralPoolContractAddress(
        deployedCollateralPool.address
      );
      await marketContractRegistry.addAddressToWhiteList(deployedMarketContract.address);


      deployedMarketContract = await MarketContractOraclize.new(
        "BCHUSD_" + expirationString,
        MarketToken.address,
        CollateralToken.address,
        [50000, 200000, 2, 1e+18, marketContractExpiration],
        "URL",
        "json(https://api.kraken.com/0/public/Ticker?pair=BCHUSD).result.BCHUSD.c.0",
        86400,
        {gas: gasLimit, value: web3.toWei('.3', 'ether'), from: web3.eth.accounts[0]}
      );

      deployedCollateralPool = await MarketCollateralPool.new(
        deployedMarketContract.address
      );
      await deployedMarketContract.setCollateralPoolContractAddress(
        deployedCollateralPool.address
      );
      await marketContractRegistry.addAddressToWhiteList(deployedMarketContract.address);

    });

    deployer.deploy(QueryTest).then(async function () {
      // by forcing the first query when we deploy we can make sure all the prices are accurate since
      // the first query is free with oraclize.
      let queryTestContract = await QueryTest.deployed();
      await queryTestContract.testOracleQuery(
        "URL",
        "json(https://api.kraken.com/0/public/Ticker?pair=BCHUSD).result.BCHUSD.c.0",
        {value: web3.toWei('.0001', 'ether'), from: web3.eth.accounts[0]}
      );
    });
  }
};

