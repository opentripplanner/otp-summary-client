
CSS = $(shell find lib -name '*.css')
HTML = $(shell find lib -name '*.html')
JS = $(shell find lib -name '*.js')
JSON = $(shell find lib -name '*.json')

PORT = 3000

build: components $(CSS) $(HTML) $(JS) $(JSON)
	@$(MAKE) lint
	@$(MAKE) test
	@./node_modules/.bin/component build --dev --verbose

beautify:
	@./node_modules/.bin/js-beautify --replace $(JS)

clean:
	@rm -rf build
	@rm -rf components
	@rm -rf node_modules

components: component.json $(JSON)
	@./node_modules/.bin/component install --dev --verbose

install: node_modules components

node_modules: package.json
	@npm install

lint:
	@./node_modules/.bin/jshint $(JS)

release: beautify lint test
	@./node_modules/.bin/component build --verbose --use

serve:
	@./node_modules/.bin/serve --port $(PORT)

test:
	@./node_modules/.bin/mocha

watch:
	@watch $(MAKE) build

.PHONY: beautify lint test watch
