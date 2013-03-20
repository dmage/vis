MODULES=\
	core \
	uniq-id \
	task-scheduler \
	units \
	binary-search \
	color-to-rgba

BLOCKS=\
	b-axis \
	i-chart \
	i-tango-color-scheme \
	i-static-range-provider \
	i-time-range-provider \
	i-current-time-range-provider \
	i-data-range-provider \
	i-scale-linear \
	i-math-data-provider \
	i-hammy-data-provider \
	b-chart \
	b-grid-overlay \
	b-render-overlay \
	b-tooltip-overlay \
	b-line-render

SOURCES=\
	$(foreach module,$(MODULES),modules/$(module).js) \
	$(wildcard $(foreach block,$(BLOCKS),blocks/$(block)/$(block).js))

.PHONY: all
all: vis.js

vis.js: $(SOURCES)
	cat $^ > $@

.PHONY: inotify
inotify:
	@inotifywait -e close_write -m $(SOURCES) | \
	while read -r line; do \
		$(MAKE); \
	done
