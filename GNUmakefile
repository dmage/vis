MODULES=\
	core \
	uniq-id \
	task-scheduler \
	units \
	binary-search \
	color-to-rgba \
	benchmark

BLOCKS=\
	b-axis \
	i-chart \
	i-tango-color-scheme \
	i-static-range-provider \
	i-time-range-provider \
	i-current-time-range-provider \
	i-data-range-provider \
	i-scale-linear \
	i-static-data-provider \
	i-math-data-provider \
	i-hammy-data-provider \
	i-graphite-data-provider \
	i-average-filter \
	i-average-processor \
	i-stacked-processor \
	b-chart \
	b-grid-overlay \
	b-render-overlay \
	b-tooltip-overlay \
	b-line-render \
	b-cubic-spline-render \
	b-9 \
	b-box \
	b-layout \
	b-loading

SOURCES_JS=\
	$(foreach module,$(MODULES),modules/$(module).js) \
	$(wildcard $(foreach block,$(BLOCKS),blocks/$(block)/$(block).js))

SOURCES_CSS=\
	$(wildcard $(foreach block,$(BLOCKS),blocks/$(block)/$(block).css))

.PHONY: all
all: vis.js vis.css

vis.js: $(SOURCES_JS)
	cat $^ > $@

vis.css: $(SOURCES_CSS)
	cat $^ > $@

.PHONY: doc
doc: vis.js vis.css
	cd $@ && $(MAKE)

.PHONY: inotify
inotify:
	@inotifywait -e close_write -m $(SOURCES_JS) $(SOURCES_CSS) | \
	while read -r line; do \
		$(MAKE); \
	done
