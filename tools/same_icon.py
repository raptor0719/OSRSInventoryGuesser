import os
from PIL import Image
import imagehash
import pathlib
import utils

# Define icons that are technically different, yet visually look the same.
# Note that for each group, all items of that group will need to be manually added.
# Any icon represented in any of these groups will not be considered for automated matching.
_DEFINED_SAME_ICONS_GROUPS = [
	["Gin.png", "Khali_brew.png"]
]

# PUBLIC

def generate_reports(icons_dir, report_file_name, visual_report_file_name):
	groups = _group_by_similarity(icons_dir)
	
	_generate_report(groups, report_file_name)
	_generate_visual_report(groups, icons_dir, visual_report_file_name)

# INTERNAL

def _generate_report(groups, output_file_name):
	with open(output_file_name, 'w') as output_file:
		for index,group in enumerate(groups):
			for icon in group:
				output_file.write(str(index) + " " + icon + "\n")

def _generate_visual_report(groups, icons_dir, output_file_name):
	icons_dir_absolute_path = str(pathlib.Path(icons_dir).resolve())
	
	xml_writer = utils.XMLWriter(output_file_name)
	
	xml_writer.output_start_tag("html")
	xml_writer.output_start_tag("head")
	xml_writer.output_start_tag("style")
	xml_writer.output_raw("img {width=5em;}")
	xml_writer.output_end_tag("style")
	xml_writer.output_end_tag("head")
	xml_writer.output_start_tag("body")
	xml_writer.output_tag_with_text("h2", "Total groups : " + str(len(groups)))
	for index,group in enumerate(groups):
		xml_writer.output_tag_with_text("h2", "Group " + str(index))
		for icon in group:
			xml_writer.output_start_tag("span")
			xml_writer.output_tag_with_text("span", icon)
			xml_writer.output_tag_with_text_and_attributes("img", "", {"src": icons_dir_absolute_path + "/" + icon})
			xml_writer.output_end_tag("span")
	xml_writer.output_end_tag("body")
	xml_writer.output_end_tag("html")
	
	xml_writer.close()

def _group_by_similarity(icons_dir):
	file_list = [os.path.join(icons_dir, f) for f in os.listdir(icons_dir)]
	
	hashes = _compute_hashes(file_list)
	
	groups = []
	used = []
	
	for defined in _DEFINED_SAME_ICONS_GROUPS:
		groups.append(defined)
		for file in defined:
			used.append(file)
	
	for file1,hash1 in hashes.items():
		if file1 in used:
			continue
		group = []
		group.append(file1)
		for file2,hash2 in hashes.items():
			if (not file1 is file2) and hash1 == hash2:
				group.append(file2)
		if len(group) > 1:
			groups.append(group)
			for item in group:
				used.append(item)
	
	return groups

def _compute_hashes(file_list):
	hashes = {}
	
	for file_name in file_list:
		img = Image.open(file_name)
		hashes[os.path.basename(file_name)] = _compute_total_color_hash(img)
	
	return hashes

def _compute_total_color_hash(image_file):
	converted = image_file.convert("RGBA")
	red,green,blue,alpha = converted.split()
	
	hash_red = imagehash.phash(red, hash_size=16)
	hash_green = imagehash.phash(green, hash_size=16)
	hash_blue = imagehash.phash(blue, hash_size=16)
	hash_alpha = imagehash.phash(alpha, hash_size=16)
	
	average_color = converted.resize((1,1)).getpixel((0,0))
	average_color_str = "{0}-{1}-{2}-{3}".format(*average_color)
	
	return str(hash_red) + str(hash_green) + str(hash_blue) + str(hash_alpha) + ":" + average_color_str

