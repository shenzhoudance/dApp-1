import contract from 'truffle-contract';

export function deployContract(
  { web3, contractSpecs },
  { MarketContractRegistry, MarketContract, MarketCollateralPool, MarketToken },
) {
  const type = 'DEPLOY_CONTRACT';

  return function(dispatch) {
    dispatch({ type: `${type}_PENDING` });

    // Double-check web3's status
    if (web3 && typeof web3 !== 'undefined') {
      // Using truffle-contract create needed contract objects and set providers
      const marketContractRegistry = contract(MarketContractRegistry);
      marketContractRegistry.setProvider(web3.currentProvider);

      const marketContract = contract(MarketContract);
      marketContract.setProvider(web3.currentProvider);

      const marketCollateralPool = contract(MarketCollateralPool);
      marketCollateralPool.setProvider(web3.currentProvider);

      const marketToken = contract(MarketToken);
      marketToken.setProvider(web3.currentProvider);

      // create array to pass to MARKET contract constructor
      const contractConstructorArray = [
        contractSpecs.priceFloor,
        contractSpecs.priceCap,
        contractSpecs.priceDecimalPlaces,
        contractSpecs.qtyMultiplier,
        contractSpecs.expirationTimeStamp
      ];

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any
        if (error) {
          console.error(error);
        }

        console.log('Attempting to deploy contract from ' + coinbase);

        // find the address of the MKT token so we can link to our deployed contract
        let marketContractInstanceDeployed;

        marketToken
          .deployed()
          .then(function(marketTokenInstance) {
            return marketContract.new(
              contractSpecs.contractName,
              marketTokenInstance.address,
              contractSpecs.baseTokenAddress,
              contractConstructorArray,
              contractSpecs.oracleDataSource,
              contractSpecs.oracleQuery,
              contractSpecs.oracleQueryRepeatSeconds,
              {
                gas: 6100000, // TODO : Remove hard-coded gas
                value: web3.toWei('.2', 'ether'),
                gasPrice: web3.toWei(1, 'gwei'),
                from: coinbase
              }
            );
          })
          .then(function(marketContractInstance) {
            marketContractInstanceDeployed = marketContractInstance;
            return marketCollateralPool.new(marketContractInstance.address, {
              gas: 5100000,
              gasPrice: web3.toWei(1, 'gwei'),
              from: coinbase
            });
          })
          .then(function(marketCollateralPoolInstance) {
            return marketContractInstanceDeployed.setCollateralPoolContractAddress(
              marketCollateralPoolInstance.address, {
                from: coinbase,
                gasPrice: web3.toWei(1, 'gwei')
              }
            );
          })
          .then(function() {
            return marketContractRegistry.deployed();
          })
          .then(function(marketContractRegistryInstance) {
            marketContractRegistryInstance.addAddressToWhiteList(
              marketContractInstanceDeployed.address,
              {
                from: web3.eth.accounts[0],
                gasPrice: web3.toWei(1, 'gwei')
              }
            );

            dispatch({ type: `${type}_FULFILLED`, payload: marketContractInstanceDeployed });
          })
          .catch(err => {
            dispatch({ type: `${type}_REJECTED`, payload: err });
          });
      });
    } else {
      dispatch({ type: `${type}_REJECTED`, payload: {'error': 'Web3 not initialised'} });
    }
  };
}
