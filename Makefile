# make targets for MARKETProtocol/dApp

# name of the AWS profile for deployment of the site to dev
DEV_PROFILE_NAME=dev-dapp-rw
# target AWS bucket for dev deployment
DEV_BUCKET=s3://dev.dapp.marketprotocol.io

# prerequisites
#   mkdir $(DEV)/MARKETProtocol
#   cd $(DEV)/MARKETProtocol
#   git clone https://github.com/MARKETProtocol/dApp.git
#   git clone https://github.com/MARKETProtocol/ethereum-bridge.git

# path to oraclize/ethereum-bridge
EB_PATH=../ethereum-bridge

# default target
default:
	pwd

# install truffle 4.1.3 as latest versions throw error while migrate
install_truffle:
	npm i -g truffle@4.1.3

# install required dependencies
install_deps:
	npm i # for dApp
	cd $(EB_PATH) ; npm install # for ethereum-bridge

# open truffle console with a local development blockchain
start_console:
	truffle develop

# start ethereum bridge
start_bridge:
	cd $(EB_PATH) ; node bridge -H localhost:9545 -a 9 --dev

#
# truffle console commands
#
#   migrate
#   test
#

# start dApp
start_dapp:
	npm start

# start dApp with rinkeby abi's
start_dapp_rinkeby:
	npm start:rinkeby		  # run npm - should point metamask browser at rinkeby

# run tests
run_tests:
	npm run test -- --coverage # run automated test suite

# docker migrate
docker_migrate:
	docker-compose exec truffle truffle migrate --network=development

# DEV - display contents of deployed site
ls_dev:
	aws s3 --profile $(DEV_PROFILE_NAME) ls $(DEV_BUCKET)

# DEV - remove deployed site from s3 bucket
rm_dev:
	aws s3 --profile $(DEV_PROFILE_NAME) rm $(DEV_BUCKET)/dev --recursive

# DEV - deploy rinkeby site to s3 bucket
deploy_dev:
	npm run build:rinkeby
	aws s3 --profile $(DEV_PROFILE_NAME) cp dApp/ $(DEV_BUCKET) --recursive
