# makefile for whitelist-api
#
PROVIDER=aws
AWS_REGION=us-east-1
STAGE=dev

install:
	npm install
	npm install -g serverless

# configure credentials
#   a. with serverless via 'serverless config credentials'
#   b. with aws-cli via 'aws configure'
#   c. with an existing AWS profile via 'export AWS_PROFILE="profilename"'
#   d. with deploy via 'serverless deploy --aws-profile profilename'
#   e. using per stage profiles
#
# e.g.
#  config_creds:
#	serverless config credentials -p $(PROVIDER) -k ${AWS_KEY} -s ${AWS_SECRET}
# or, alternately, for local development...
#   set the environment variable 'AWS_PROFILE'
#   store the approriate credentials using the aws cli or in ~/.ec2/credentials


## status

# deployment info
info:
	serverless info -v -s $(STAGE) -r $(AWS_REGION) 

# display deployments
list:
	serverless deploy list -s $(STAGE) -r $(AWS_REGION) 


## packaging and deployment

# package
package:
	serverless -s $(STAGE) -r $(AWS_REGION) package

# deploy: verbose w/ some specific options
deploy:
	serverless -v -s $(STAGE) -r $(AWS_REGION) deploy 

# deploy a specific function (e.g. create)
deploy_create:
	serverless -v -s $(STAGE) -r $(AWS_REGION) -f create deploy 

# remove deployed service
remove:
	serverless -s $(STAGE) -r $(AWS_REGION) remove


## testing

# invoke a specific function
invoke_create:
	serverless -s $(STAGE) -r $(AWS_REGION) -f create invoke

# watch logs on a specific function
logs_create:
	serverless -s $(STAGE) -r $(AWS_REGION) -f create logs

# metrics
metrics:
	serverless -s $(STAGE) -r $(AWS_REGION) metrics

