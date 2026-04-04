#!/bin/sh

export PYTHONPATH=$(pwd)/tools

WORKING_DIR="working"

ITEMS_FILE="$WORKING_DIR/items.xml"
SAME_ICON_REPORT="$WORKING_DIR/same_icon_report"
ICONS_DIR="$WORKING_DIR/icons"

ITEMS_JS_METADATA_FILE="$WORKING_DIR/items-metadata.js"
ITEMS_ALTS_JS_METADATA_FILE="$WORKING_DIR/items-alternatives-metadata.js"

mkdir $ICONS_DIR

python -c "import data_dump; data_dump.dump_items('$ITEMS_FILE')"
python -c "import data_dump; data_dump.dump_icons('$ITEMS_FILE', '$ICONS_DIR')"
find $ICONS_DIR -type f -print0 | xargs -0 md5sum | sort -k1,32 | uniq -w32 -D > $SAME_ICON_REPORT
python -c "import generate_js_metadata; generate_js_metadata.generate_js_metadata('$ITEMS_FILE', '$ITEMS_JS_METADATA_FILE')"
python -c "import generate_js_metadata; generate_js_metadata.generate_js_alternatives_metadata('$ITEMS_FILE', '$SAME_ICON_REPORT', '$ITEMS_ALTS_JS_METADATA_FILE')"

