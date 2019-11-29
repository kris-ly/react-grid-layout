.DELETE_ON_ERROR:

export BIN := $(shell npm bin)
PATH := $(BIN):$(PATH)
DIST = ./dist
BUILD = ./build
LIB = ./lib
TEST = ./test
MIN = $(DIST)/react-grid-layout.min.js
MIN_MAP = $(DIST)/react-grid-layout.min.js.map

.PHONY: test dev lint build clean install link


build: clean build-js $(MIN)

clean:
	rm -rf $(BUILD) $(DIST)

dev:
	@$(BIN)/webpack-dev-server --config webpack-dev-server.config.js \
	  --hot --progress --colors 

# Allows usage of `make install`, `make link`
install link:
	@npm $@

# Build browser module
dist/%.min.js: $(LIB) $(BIN)
	@$(BIN)/webpack

build-js:
	@$(BIN)/babel --out-dir $(BUILD) $(LIB)

# Will build for use on github pages. Full url of page is
# https://strml.github.io/react-grid-layout/examples/0-showcase.html
# so the CONTENT_BASE should adapt.
build-example:
	@$(BIN)/webpack --config webpack-examples.config.js
	env CONTENT_BASE="/react-grid-layout/examples/" node ./examples/generate.js

view-example:
	env CONTENT_BASE="/examples/" node ./examples/generate.js
	@$(BIN)/webpack-dev-server --config webpack-examples.config.js --progress --colors 

# FIXME flow is usually global
lint:
	@$(BIN)/flow
	@$(BIN)/eslint --ext .js,.jsx $(LIB) $(TEST)

test:
	@$(BIN)/jest
