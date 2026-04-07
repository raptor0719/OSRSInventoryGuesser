# OSRS Inventory Guesser
The OSRS Inventory Guesser is a web-application built on Old School Runescape's inventory system. This application uses the
icon uniqueness of OSRS to make an icon identification game, where the user is asked to identify items from the game in the given inventory.

This project not only contains the html/css/js that constitutes the application but also the various tools used to lookup item data, download icons, and then generate the subsequent metadata that
the application uses. Item data and icons are retrieved via the extremely well maintained OSRS wiki found here https://oldschool.runescape.wiki using the MediaWiki api. 

The latest version of the guesser is hosted publically here: http://www.modernmagicks.com/osrsInventoryGuesser/inventory-guesser.html

It can also be ran locally and completely offline. See below for instructions.

## Running locally and offline

1. Download the latest release from here: https://github.com/raptor0719/OSRSInventoryGuesser/releases
2. Unpack the archive into the directory of your choice.
3. Unpack the icons.zip into the same directory.
4. Create the directory 'third-party' in this same directory.
5. Download jquery 3.7.1 from here: https://code.jquery.com/jquery-3.7.1.min.js
6. Put the 'jquery-3.7.1.min.js' file in the created directory from step #4.

You should now have a directory that looks like:
```
/icons
/third-party
/tools
inventory-guesser.html
inventory-guesser.css
...
```

Now, you can open 'inventory-guesser.html' in the browser of your choice and play locally and completely offline.

## Building the metadata yourself

If you're running locally, you may want to update the metadata to pickup new items from newer OSRS releases.

The guesser has 3 primary files that item data is stored:
- The icons directory which has just the image files for the icons of each item.
- 'items-metadata.js' which contains the list of all items in the item pool and their associated data (name and variants).
- 'items-alternatives-metadata.js' which contains mappings of item variants to other item variants. This accounts for the multiple items having the same icon.

The tooling used to generate these files is written in python. The shell script 'build_metadata_from_wiki.sh' gives a straightforward step-by-step
to go from nothing to having fully built metadata and icons. The general flow is as follows:
1. mwclient is used to interact with the OSRS wiki's MediaWiki api.
      - The list of items is pulled via the 'Items' category.
      - Items are filtered out based on a variety of criteria and then serialized to a local file.
      - Icon names are pulled from the item data and used to download the icons.
2. The icons are then analyzed using imagehash to detect sameness, with reports generated locally.
3. The icons, item data, and sameness reports are then used to generate the .js metadata files.

## Dependecies Used
The following are what is used to run, develop, and test the guesser:

Application
- jQuery v3.7.1
- An updated browser (Firefox and Google Chrome were used for testing)

Tooling
- Python v3.14.3
- mwclient v0.11.0 for python
- imagehash v4.3.2 for python

## Credits
Credits
- Developed by raptor0719
- OSRS for the icons and inventory visual

Special thanks to:
- the friends that gave me some good ideas along the way. You know who you are.
- the folks maintaining the OSRS wiki for without them this project would be much more difficult.
- Jagex and the Old School Runescape team for maintaining such a wonderful game.
