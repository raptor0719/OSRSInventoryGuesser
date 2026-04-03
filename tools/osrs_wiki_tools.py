from mwclient import Site

def get_osrs_wiki_site():
	user_agent = "ItemDumper/0.1 (shortmangamer0719@gmail.com)"
	site = Site("oldschool.runescape.wiki", clients_useragent=user_agent, path='/')
	site.maxlag = 5
	return site
