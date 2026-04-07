FILTERED_CATEGORIES = ["Discontinued content", "Unobtainable items", "Interface items", "Deadman seasonal items", "Sailing beta content"]
FILTERED_NAME_SUBSTRINGS = ["(interface item)", "(discontinued)", "(Last Man Standing)", "(beta)", "(deadman)", "(Player-owned house)", "(Deadman starter pack)", "(RuneScape 2 Beta)", "(Deadman Mode)", "animation item", "Halloween event)", "(Mage Training Arena)", "(unobtainable item)", "Dni23"]
FILTERED_WHOLE_NAMES = ["Hat", "Collection log/Table", "Consumables", "Zamorkian items", "Hunter's mix", "Regular cape", "Monkey Madness helper", "Viking toy ship", "Anim offhand", "Oak raft base", "Left-handed banana", "Paintbrush", "A jester stick", "Apricot cream pie", "Bow and arrow", "Community pumpkin"]
FILTERED_TEXT_SUBSTRINGS = ["[[animation item]]", "{{Animation items}}"]

def should_include_item(name, text, categories):
	if name.startswith("Category:") or name == "Items":
		return False
	for category in categories:
		if category in FILTERED_CATEGORIES:
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

