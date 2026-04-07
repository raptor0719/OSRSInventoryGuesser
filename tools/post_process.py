import wiki_utils
import metadata_utils
import item_filter
import data_dump
import time
import os

def list_unused_icons(items_file_name, icons_dir, unused_icons_report_file_name):
	icon_is_used = {}
	
	icon_files_list = os.listdir(icons_dir)
	for icon_file in icon_files_list:
		icon_is_used[icon_file] = False
	
	items = metadata_utils.read_items_metadata(items_file_name)
	
	for item in items:
		for variant in item['variants']:
			file_name = variant['icon_file_name']
			icon_is_used[file_name] = True
	
	with open(unused_icons_report_file_name, 'w') as output_file:
		for icon_file,is_used in icon_is_used.items():
			if not is_used:
				output_file.write(icon_file + "\n")

def filter(items_file_name, output_file_name, remove_items_report_file_name):
	items = metadata_utils.read_items_metadata(items_file_name)
	
	new_items = []
	with open(remove_items_report_file_name, 'w') as output_file:
		for item in items:
			if item_filter.should_include_item(item["name"], item["text"], item["categories"]):
				new_items.append(item)
			else:
				output_file.write(item["name"] + "\n")
	
	metadata_utils.write_items_metadata(new_items, output_file_name)

def enrich_categories(items_file_name, output_file_name):
	items = metadata_utils.read_items_metadata(items_file_name)
	
	site = wiki_utils._get_osrs_wiki_site()
	
	new_items = []
	for item in items:
		page = site.pages[item["name"]]
		categories = data_dump._clean_categories(page.categories())
		new_items.append(metadata_utils.create_item(item["name"], item["text"], categories))
		print(item["name"])
		time.sleep(0.2)
	
	metadata_utils.write_items_metadata(new_items, output_file_name)

