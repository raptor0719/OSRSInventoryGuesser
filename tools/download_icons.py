import os
import time
import guesser_utils

to_download = [["Emerald_bolts_(e)_1.png", "Emerald_bolts_(e)_1.png"], ["Armadyl_communiqué.png", "Armadyl_communique.png"], ["Chichilihui_rosé.png", "Chichilihui_rose.png"], ["Grubs_à_la_mode.png", "Grubs_a_la_mode.png"], ["Imperial_rosé.png", "Imperial_rose.png"], ["Xochipaltic_rosé.png", "Xochipaltic_rose.png"]]

def download_icon(item_name, server_file_name, local_file_name, site):
	file = site.images[server_file_name]

	if not file.exists:
		guesser_utils.printErr(server_file_name + " does not exist, for item " + item_name)
		return

	#with open(local_file_name, 'wb') as fd:
	#	file.download(fd)

def download_icons(items, iconsDir, site):
	already_downloaded = {}
	for item in items:
		for variant in item["variants"]:
			server_file_name = variant["icon_file_name"]

			if server_file_name in already_downloaded:
				print("Skipped " + server_file_name + " for " + item["name"])
				continue

			local_file_name = guesser_utils.compute_icon_file_name(server_file_name)
			local_file_name = os.path.join(iconsDir, local_file_name)

			print(item["name"] + " : " + server_file_name + " to " + local_file_name)
			download_icon(item["name"], server_file_name, local_file_name, site)
			already_downloaded[server_file_name] = True

			#time.sleep(0.2)

items = guesser_utils.parse_items_metadata("items.xml")
site = guesser_utils.get_osrs_wiki_site()

download_icons(items, "icons", site)
