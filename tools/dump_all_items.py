import time
import sys
import guesser_utils

def pull_categories_from_page(pageCategories):
	categories = []
	for pageCategory in pageCategories:
		categories.append(pageCategory.name.removeprefix("Category:"))
	return categories

site = get_osrs_wiki_site()

category = site.categories['Items']

guesser_utils.outputStartTag("items", 0)

skippedCount = 0
for index, page in enumerate(category):
	pageCategories = page.categories()
	page_text = page.text()

	if not should_process_item(page.name, page_text, pageCategories):
		print("!! " + str(index) + "\t" + page.name, file=sys.stderr)
		skippedCount += 1
		continue

	print(str(index) + "\t" + page.name, file=sys.stderr)

	page = site.pages[page.name]

	item = guesser_utils.create_item(page.name, page.text(), pull_categories_from_page(pageCategories))

	guesser_utils.outputItem(item, 1)

	time.sleep(0.1)

guesser_utils.outputEndTag("items", 0)

print("Skipped count = " + str(skippedCount), file=sys.stderr)
