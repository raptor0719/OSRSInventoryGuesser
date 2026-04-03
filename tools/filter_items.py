import guesser_utils

items = guesser_utils.parse_items_metadata("items.xml")

guesser_utils.outputStartTag("items", 0)

accepted = 0
rejected = 0
for item in items:
	if guesser_utils.should_process_item(item["name"], item["text"], item["categories"]):
		guesser_utils.outputItem(item, 1)
		accepted += 1
	else:
		guesser_utils.printErr("Removed: " + item["name"])
		rejected += 1

guesser_utils.outputEndTag("items", 0)

guesser_utils.printErr("accepted = " + str(accepted))
guesser_utils.printErr("rejected = " + str(rejected))
