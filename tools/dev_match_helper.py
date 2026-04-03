
def transform_line(lineRaw):
	line = lineRaw.strip()
	iconFileName = "icons/" + line.replace(" ", "_") + ".png"
	processed = "Util.createItemVariantName(\"" + line + "\", \"" + iconFileName + "\"),"
	print(processed)

with open("dev-match-list", 'r') as file:
	for line in file:
		transform_line(line)

