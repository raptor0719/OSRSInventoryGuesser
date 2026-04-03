import guesser_utils

def generate_js_metadata(items):
	print("var ItemsMetadata = [")
	for i in range(len(items)):
		item = items[i]

		prefix = "\tcreateItemMetadata("
		name = "\"" + item["name"] + "\""
		variants = ""
		for j in range(len(item["variants"])):
			variant = item["variants"][j]
			variants += "createItemVariantMetadata("
			variants += "["
			for k in range(len(variant["names"])):
				variants += "\"" + variant["names"][k] + "\""
				if not k == len(variant["names"]) - 1:
					variants += ", "
			variants += "], "
			variants += "\"icons/" + variant["icon_file_name"] + "\""
			variants += ")" + ("" if j == len(item["variants"]) - 1 else ", ")
		suffix = ")" + ("" if i == len(items) - 1 else ",")

		print(prefix + name + ", [" + variants + "]" + suffix)
	print("];");

def generate_js_alternatives_metadata(alternative_groups, alternatives):
	print("var ItemsAlternativesMetadata = [")
	for groups_alternatives in alternatives:
		prefix = "\t["
		suffix = "],"
		group_str = ""
		for alternative in groups_alternatives:
			item_index = alternative["item_index"]
			group_str += "{\"item_index\": " + str(item_index) + ", "
			group_str += "\"variant_indices\": ["
			for variant_index in alternative["variant_indices"]:
				group_str += str(variant_index) + ", "
			group_str += "]},"
		print(prefix + group_str + suffix)
	print("];")

	print ("var ItemsAlternativesLookup = {")
	for index,group in enumerate(alternative_groups):
		for icon_name in group:
			print("\t\"icons/" + icon_name + "\": " + str(index) + ",")
	print("};")

def find_alternatives(items, alternative_groups):
	alternatives = []
	for group in alternative_groups:
		group_item_variants = []
		for icon_name in group:
			group_item_variants.extend(find_item_variants_for_icon_name(items, icon_name))
		alternatives.append(group_item_variants)
	return alternatives

def collapse_alternatives(alternatives):
	collapsed = []
	for group in alternatives:
		unique_items = {}
		for item_variant in group:
			item_index = item_variant["item_index"]
			variant_index = item_variant["variant_index"]
			if not item_index in unique_items:
				unique_items[item_index] = []
			unique_items[item_index].append(variant_index)
		collapsed_group = []
		for item_index,variant_indices in unique_items.items():
			collapsed_group.append({
				"item_index": item_index,
				"variant_indices": variant_indices
			})
		collapsed.append(collapsed_group)
	return collapsed

def find_item_variants_for_icon_name(items, icon_name):
	item_variants = []
	for i,item in enumerate(items):
		for j,variant in enumerate(item["variants"]):
			variant_icon_name = variant["icon_file_name"]
			if icon_name == variant_icon_name:
				item_variants.append({
					"item_index": i,
					"variant_index": j
				})
	return item_variants

def parse_same_icons_report(same_icons_filename):
	alternative_groups = []

	current_group_key = ""
	current_group = []

	with open(same_icons_filename, 'r') as same_icons_file:
		for line in same_icons_file:
			split = line.split("  ./")
			key = split[0]
			icon_file_name = split[1].strip()
			if key != current_group_key:
				if current_group_key != "":
					alternative_groups.append(current_group)
					current_group = []
				current_group_key = key
			current_group.append(icon_file_name)

	alternative_groups.append(current_group)

	return alternative_groups

items = guesser_utils.parse_items_metadata("../items.xml")

#generate_js_metadata(items)

alternative_groups = parse_same_icons_report("../same_icons.report")
alternatives = collapse_alternatives(find_alternatives(items, alternative_groups))

generate_js_alternatives_metadata(alternative_groups, alternatives)
