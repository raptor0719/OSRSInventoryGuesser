import wiki_utils
import metadata_utils
import item_filter

# PUBLIC

def dump_items(output_file_name):
	wiki_items = wiki_utils.get_wiki_items()
	
	items = []
	for wiki_item in wiki_items:
		item_categories = _clean_categories(wiki_item["categories"])
		item = metadata_utils.create_item(wiki_item["name"], wiki_item["text"], item_categories)
		if item_filter.should_include_item(item["name"], item["text"], item["categories"]):
			items.append(item)
	
	metadata_utils.write_items_metadata(items, output_file_name)

def dump_icons(items_file_name, target_dir):
	items = metadata_utils.read_items_metadata(items_file_name)
	icon_names = _create_icon_name_set(items)
	wiki_utils.download_wiki_item_icons(icon_names, target_dir)

# INTERNAL

def _clean_categories(item_categories):
	cleaned_categories = []
	for category in item_categories:
		cleaned_categories.append(_clean_category_name(category.name))
	return cleaned_categories
	
def _clean_category_name(category_name):
	return category_name.removeprefix("Category:")

def _create_icon_name_set(items):
	icon_names = {}
	for item in items:
		for variant in item["variants"]:
			local_file_name = variant["icon_file_name"]
			server_file_name = variant["server_icon_file_name"]
			
			icon_names[local_file_name] = server_file_name
	
	return icon_names

