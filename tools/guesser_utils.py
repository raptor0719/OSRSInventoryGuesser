import sys
import re
import xml.etree.ElementTree as xml

FILTERED_CATEGORIES = ["Discontinued content", "Unobtainable items", "Interface items"]
FILTERED_NAME_SUBSTRINGS = ["(interface item)", "(discontinued)", "(Last Man Standing)", "(beta)", "(deadman)", "(Player-owned house)", "(Deadman starter pack)", "(RuneScape 2 Beta)", "(Deadman Mode)", "animation item", "Halloween event)", "(Mage Training Arena)", "(unobtainable item)", "Dni23"]
FILTERED_WHOLE_NAMES = ["Hat", "Collection log/Table", "Consumables", "Zamorkian items", "Hunter's mix", "Regular cape", "Monkey Madness helper", "Viking toy ship", "Anim offhand", "Oak raft base", "Left-handed banana", "Paintbrush", "A jester stick", "Apricot cream pie", "Bow and arrow", "Community pumpkin"]
FILTERED_TEXT_SUBSTRINGS = ["[[animation item]]", "{{Animation items}}"]

def should_process_item(name, text, categories):
	if name.startswith("Category:") or name == "Items":
		return False
	for pageCategory in categories:
		if pageCategory.name in FILTERED_CATEGORIES:
			return False
	for substr in FILTERED_NAME_SUBSTRINGS:
		if substr in name:
			return False
	for whole_name in FILTERED_WHOLE_NAMES:
		if name == whole_name:
			return False
	for substr in FILTERED_TEXT_SUBSTRINGS:
		if substr in text:
			return False
	if "Clue scroll" in name and "-" in name:
		return False
	return True

def parse_items_metadata(file_path):
	tree = xml.parse(file_path)
	root = tree.getroot()

	items = []

	for item_node in root.findall('item'):
		name = unescape_xml(item_node.findtext('name'))
		text = item_node.findtext('text')
		items.append(create_item(
			name,
			text,
			[category.text for category in item_node.findall('categories/category')],
			parse_variants(name, text)))

	return items

def parse_variants(name, text):
	names = []
	images = []

	parsing_infobox = False
	for line in text.splitlines():
		if parsing_infobox:
			if line.startswith("|name"):
				names.append(line.split("=")[1].strip())
			if line.startswith("|image"):
				image_name = line.split("=")[1].strip()
				images.append(parse_image_list(image_name))
			if line == "}}" or line.startswith("}}") or (line.endswith("}}") and not "{{Null name}}" in line):
				break
		else:
			if line == "{{Infobox Item" or line.endswith("{{Infobox Item") or line == "Infobox Item":
				parsing_infobox = True

	variants = []
	if len(names) == len(images):
		for i in range(len(names)):
			for image in images[i]:
				variants.append(create_variant(names[i], compute_icon_file_name(image)))
	elif len(names) == 1:
		n = names[0]
		for image_list in images:
			for image in image_list:
				variants.append(create_variant(n, compute_icon_file_name(image)))
	elif len(images) == 1:
		i = images[0]
		for image in i:
			for n in names:
				variants.append(create_variant(n, compute_icon_file_name(image)))
	else:
		printErr("Unknown situation for: " + name + " " + str(len(names)) + " " + str(len(images)))

	return collapse_variants(variants)

def collapse_variants(variants):
	collapsed = {}
	for variant in variants:
		name = variant["name"]
		icon_file_name = variant["icon_file_name"]
		if not icon_file_name in collapsed:
			collapsed[icon_file_name] = []
		collapsed[icon_file_name].append(name)
		
	newVariants = []
	for k,v in collapsed.items():
		newVariants.append({"names": v, "icon_file_name": k})
	return newVariants

def find_item_by_name(items, name):
	for i in items:
		if i["name"] == name:
			return i
	return {}

def parse_image_list(image_list_string):
	cleaned = image_list_string.replace("]] [[", "]][[")
	cleaned = cleaned.replace("<br/>", "")
	image_list = cleaned.split("]][[")
	for i in range(len(image_list)):
		image_list[i] = image_list[i].replace("[[", "")
		image_list[i] = image_list[i].replace("File:", "")
		image_list[i] = image_list[i].replace("FIle:", "")
		image_list[i] = image_list[i].replace("]]", "")
	return image_list

def create_item(name, text, categories, variants):
	return {
		"name": name,
		"text": text,
		"categories": categories,
		"variants": variants
	}

def create_variant(name, icon_file_name):
	return {
		"name": name,
		"icon_file_name": icon_file_name
	}

def compute_icon_file_name(icon_name):
	fixed = icon_name.replace(" ", "_")
	fixed = fixed.replace("é", "e")
	fixed = fixed.replace("à", "a")
	return fixed

def check_variants(items):
	for i in items:
		if len(i["variants"]) < 1:
			print(i["name"] + " has no variants")
		for v in i["variants"]:
			if len(v["names"]) == 0:
				print(i["name"] + " has a variant icon with no names")
			else:
				for name in v["names"]:
					if len(name) == 0:
						print(i["name"] + " has a variant icon with an empty name")

			if v["icon_file_name"].count(".png") > 1:
				print(i["name"] + " has a variant icon with multiple image files")
			elif v["icon_file_name"].count(".png") == 0:
				print(i["name"] + " has a variant icon with an empty image file")
			elif not re.match(r'^[a-zA-Z0-9\(\)\.\? \-\'\_\+\,&!#;]*$', v["icon_file_name"]):
				print(i["name"] + " icon name " + v["icon_file_name"] +  " does not match expression")		

def outputItem(item, depth):
	outputStartTag("item", depth)

	outputTagWithText("name", escape_xml(item["name"]), depth+1)
	outputTagWithText("text", cdata(item["text"]), depth+1)
	outputStartTag("categories", depth+1)
	for category in item["categories"]:
		outputTagWithText("category", category, depth+2)
	outputEndTag("categories", depth+1)

	outputEndTag("item", depth)

def escape_xml(s):
	escaped = s.replace("&", "&amp;")
	escaped = escaped.replace("<", "&lt;")
	escaped = escaped.replace(">", "&gt;")
	escaped = escaped.replace("\"", "&quot;")
	escaped = escaped.replace("'", "&apos;")
	return escaped

def unescape_xml(s):
	unescaped = s.replace("&amp;", "&")
	unescaped = unescaped.replace("&lt;", "<")
	unescaped = unescaped.replace("&gt;", ">")
	unescaped = unescaped.replace("&quot;", "\"")
	unescaped = unescaped.replace("&apos;", "'")
	return unescaped

def outputTagWithText(name, text, depth):
	prefix = "\t" * depth
	print(prefix + "<" + name + ">" + text + "</" + name + ">")

def outputStartTag(name, depth):
	prefix = "\t" * depth
	print(prefix + "<" + name + ">")

def outputEndTag(name, depth):
	prefix = "\t" * depth
	print(prefix + "</" + name + ">")

def cdata(text):
	return "<![CDATA[" + text + "]]>"

def printErr(s):
	print(s, file=sys.stderr)
