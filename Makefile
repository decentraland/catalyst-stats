build-proto:
	mkdir -p src/proto
	node_modules/.bin/protoc \
		--plugin=./node_modules/.bin/protoc-gen-ts_proto \
		--ts_proto_opt=esModuleInterop=true,returnObservable=false,outputServices=generic-definitions,oneof=unions \
		--ts_proto_opt=fileSuffix=.gen \
		--ts_proto_out="$(PWD)/src/proto" \
		-I="$(PWD)/src/proto" \
		-I="$(PWD)/node_modules/@dcl/protocol/proto" \
		-I="$(PWD)/node_modules/@dcl/protocol/public" \
		"$(PWD)/node_modules/@dcl/protocol/proto/decentraland/kernel/comms/v3/archipelago.proto"  \
		"$(PWD)/node_modules/@dcl/protocol/public/bff-services.proto"

build: build-proto
	npm run build

test: build
	touch .env
	node_modules/.bin/jest --forceExit --detectOpenHandles --coverage --verbose $(TESTARGS)

install:
	npm ci

lint:
	@node_modules/.bin/eslint . --ext .ts

lint-fix: ## Fix bad formatting on all .ts and .tsx files
	@node_modules/.bin/eslint . --ext .ts --fix

.PHONY: build test codegen lint lint-fix
