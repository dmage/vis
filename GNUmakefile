SOURCES=\
	modules/core.js \
	modules/task-scheduler.js \
	modules/units.js \
	blocks/b-axis/b-axis.js \
	blocks/b-1.js \
	blocks/b-2.js \
	blocks/i-chart/i-chart.js \
	blocks/i-tango-color-scheme/i-tango-color-scheme.js \
	blocks/i-static-range-provider/i-static-range-provider.js \
	blocks/i-scale-linear/i-scale-linear.js \
	blocks/b-chart/b-chart.js

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
