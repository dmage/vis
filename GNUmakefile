MODULES=\
	core \
	task-scheduler \
	units

BLOCKS=\
	b-axis \
	i-chart \
	i-tango-color-scheme \
	i-static-range-provider \
	i-time-range-provider \
	i-current-time-range-provider \
	i-scale-linear \
	i-math-data-provider \
	b-chart \
	b-grid-overlay

SOURCES=\
	$(foreach module,$(MODULES),modules/$(module).js) \
	$(wildcard $(foreach block,$(BLOCKS),blocks/$(block)/$(block).js)) \
	blocks/b-1.js \
	blocks/b-2.js

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
