import os
import time
from mwclient import Site
import utils

# PUBLIC

def get_wiki_items():
	site = _site
	
	item_pages = site.categories['Items']
	
	wiki_items = []
	for item_page in item_pages:
		wiki_item = _create_wiki_item(item_page)
		wiki_items.append(wiki_item)
		time.sleep(0.2)
	
	return wiki_items

def download_wiki_item_icons(file_names, target_dir):
	site = _site
	
	for file_name,server_file_name in file_names.items():
		local_file_name = os.path.join(target_dir, file_name)
		
		icon_file = site.images[server_file_name]
		
		if not icon_file.exists:
			utils.printErr(server_file_name + " does not exist")
			continue
		
		with open(local_file_name, 'wb') as fd:
			icon_file.download(fd)
		
		time.sleep(0.2)

# INTERNAL

def _get_osrs_wiki_site():
	user_agent = os.getenv('USER_AGENT')
	site = Site("oldschool.runescape.wiki", clients_useragent=user_agent, path='/')
	site.maxlag = 5
	return site

# Define a single shared client
_site = _get_osrs_wiki_site()

def _create_wiki_item(item_page):
	return {
		"name": item_page.name,
		"text": item_page.text(),
		"categories": item_page.categories()
	}

