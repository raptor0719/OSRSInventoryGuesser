# OSRS Inventory Guesser
The OSRS Inventory Guesser is a web-application built on Old School Runescape's inventory system. Much of the game is balanced around the 28 slot inventory where a large majority of the items
do not stack. Items are displayed in the inventory using just a icon and, because of this, it is important from a readability percpective for the icons to be unique. This application uses this
icon uniqueness to make an icon identification game, where the user is asked to identify items in the given inventory.

This project is not only the html/css/js that constitutes the application but also the various tools used to lookup item data, download icons, and then generate the subsequent metadata that
the application uses.

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

Most of the tooling used to generate the items-metadata.js and items-alternatives-metadata.js is written in python. The shell script 'build_metadata_from_wiki.sh' gives a straightforward step-by-step
to go from nothing to having fully built metadata and icons.

## Dependecies
Tooling dependencies
- Python v3.14.3 (though likely an earlier version will work)
- mwclient v0.11.0 for python
- imagehash v4.3.2 for python

## Credits
- Developed entirely by raptor0719
- OSRS for the icons and inventory visual

Special Thanks
- To the friends that gave me some good ideas along the way. You know who you are.
- To the folks maintain the OSRS wiki https://oldschool.runescape.wiki for without them this project would be much more difficult.
- To Jagex and the Old School Runescape team for maintaining such a wonderful game.
