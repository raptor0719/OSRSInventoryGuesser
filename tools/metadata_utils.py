import sys
import re
import xml.etree.ElementTree as xml
import utils

# PUBLIC

def create_item(name, text, categories):
	return _create_item(name, text, categories, _parse_variants(name, text))

def read_items_metadata(file_path):
	tree = xml.parse(file_path)
	root = tree.getroot()

	items = []

	for item_node in root.findall('item'):
		name = utils.unescape_xml(item_node.findtext('name'))
		text = item_node.findtext('text')
		items.append(create_item(name, text, [utils.unescape_xml(category.text) for category in item_node.findall('categories/category')]))

	return items

def write_items_metadata(items, output_file_name):
	xml_writer = utils.XMLWriter(output_file_name)
	
	xml_writer.output_start_tag("items")
	for item in items:
		xml_writer.output_start_tag("item")

		xml_writer.output_tag_with_text("name", utils.escape_xml(item["name"]))
		xml_writer.output_tag_with_text("text", utils.cdata(item["text"]))
		xml_writer.output_start_tag("categories")
		for category in item["categories"]:
			xml_writer.output_tag_with_text("category", utils.escape_xml(category))
		xml_writer.output_end_tag("categories")

		xml_writer.output_end_tag("item")
	xml_writer.output_end_tag("items")
	
	xml_writer.close()

# INTERNAL

def _parse_variants(name, text):
	names = []
	images = []

	parsing_infobox = False
	for line in text.splitlines():
		if parsing_infobox:
			if line.startswith("|name"):
				names.append(line.split("=")[1].strip())
			if line.startswith("|image"):
				image_name = line.split("=")[1].strip()
				images.append(_parse_image_list(image_name))
			if line == "}}" or line.startswith("}}") or (line.endswith("}}") and not "{{Null name}}" in line):
				break
		else:
			if line == "{{Infobox Item" or line.endswith("{{Infobox Item") or line == "Infobox Item":
				parsing_infobox = True

	variants = []
	if len(names) == len(images):
		for i in range(len(names)):
			for image in images[i]:
				variants.append(_create_variant(names[i], image))
	elif len(names) == 1:
		n = names[0]
		for image_list in images:
			for image in image_list:
				variants.append(_create_variant(n, image))
	elif len(images) == 1:
		i = images[0]
		for image in i:
			for n in names:
				variants.append(_create_variant(n, image))
	else:
		utils.print_err("Unknown situation for: " + name + " " + str(len(names)) + " " + str(len(images)))

	return _collapse_variants(variants)

def _collapse_variants(variants):
	collapsed = {}
	for variant in variants:
		name = variant["name"]
		icon_file_name = variant["icon_file_name"]
		if not icon_file_name in collapsed:
			collapsed[icon_file_name] = {
				"names": [],
				"server_icon_file_name": variant["server_icon_file_name"]
			}
		collapsed[icon_file_name]["names"].append(name)
		
	newVariants = []
	for k,v in collapsed.items():
		newVariants.append({"names": v["names"], "icon_file_name": k, "server_icon_file_name": v["server_icon_file_name"]})
	return newVariants

def _parse_image_list(image_list_string):
	cleaned = image_list_string.replace("]] [[", "]][[")
	cleaned = cleaned.replace("<br/>", "")
	image_list = cleaned.split("]][[")
	for i in range(len(image_list)):
		image_list[i] = image_list[i].replace("[[", "")
		image_list[i] = image_list[i].replace("File:", "")
		image_list[i] = image_list[i].replace("FIle:", "")
		image_list[i] = image_list[i].replace("]]", "")
	return image_list

def _create_item(name, text, categories, variants):
	return {
		"name": name,
		"text": text,
		"categories": categories,
		"variants": variants
	}

def _create_variant(name, icon_file_name):
	return {
		"name": name,
		"icon_file_name": _compute_icon_file_name(icon_file_name),
		"server_icon_file_name": _compute_server_icon_file_name(icon_file_name)
	}

def _compute_icon_file_name(icon_name):
	fixed = icon_name.replace(" ", "_")
	fixed = fixed.replace("é", "e")
	fixed = fixed.replace("à", "a")
	return fixed

def _compute_server_icon_file_name(icon_name):
	fixed = icon_name.replace(" ", "_")
	return fixed

def _check_variants(items):
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

