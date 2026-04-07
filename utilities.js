var Util = Util || {};

/*
* Gives a random integer value from min (inclusive) to max (inclusive)
*/
Util.randomIntInRange = function(min, max) {
	// We should start by looking at middle section because that's how the expression is evaluated.
	// Math.random() * (max - min + 1)
	//  Math.random gives a floating point value from 0 (inclusive) to 1 (non-inclusive) which can be thought as a percentage
	//  max - min + 1 gives the size of our range
	//  Multiplying this percentage by the spread we get some value in this spread
	// Math.floor chops off whatever floating point value we have because we want an integer
	// And finally the + min shifts the value into the original requested range
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

Util.resizeImgElement = function(jqImg, scaleFactor, maxPixelSize) {
	let element = jqImg;
	let width = element.width();
	let height = element.height();
	let widthIsLarger = width > height;
	let largerAxis = (widthIsLarger) ? width : height;
	let smallerAxis = (widthIsLarger) ? height : width;
	let scaleSmallerBy = smallerAxis/largerAxis;
	let largerAxisValue = Math.min(maxPixelSize, largerAxis * scaleFactor);
	let largerAxisDiff = largerAxisValue - largerAxis;
	let smallerAxisValue = smallerAxis + (largerAxisDiff * scaleSmallerBy);
	let largerAxisPadding = (maxPixelSize - largerAxisValue)/2;
	let smallerAxisPadding = (maxPixelSize - smallerAxisValue)/2;

	width = (widthIsLarger) ? largerAxisValue : smallerAxisValue;
	height = (widthIsLarger) ? smallerAxisValue : largerAxisValue;
	let horizontalPadding = (widthIsLarger) ? largerAxisPadding : smallerAxisPadding;
	let verticalPadding = (widthIsLarger) ? smallerAxisPadding : largerAxisPadding;

	element.width(width + "px");
	element.height(height + "px");
	element.css("padding", verticalPadding + "px " + horizontalPadding + "px");
}

Util.createOSRSWikiSearchURL = function(searchTerm) {
	return "https://oldschool.runescape.wiki/?search=" + encodeURIComponent(searchTerm);
}

Util.createOSRSWikiItemURL = function(itemName) {
	url_part = itemName.replaceAll(" ", "_");
	
	return "https://oldschool.runescape.wiki/w/" + url_part
}

Util.initializeSearchField = function(textField, submitButton, showAllButton, container, getElementVal) {
	submitButton.on("click", function(event) {
		let searchTerm = textField.val().toLowerCase();

		if (searchTerm === null || searchTerm.trim() === "")
			return;

		container.children().each(function(index, rawElement) {
			let element = $(rawElement);
			let elementVal = getElementVal(element).toLowerCase();
			if (elementVal.includes(searchTerm)) {
				element.show();
			} else {
				element.hide();
			}
		});
	});
	showAllButton.on("click", function() {
		container.children().each(function(index, rawElement) {
			let element = $(rawElement);
			element.show();
		});
	});
}

Util.initializeSelectableItemContainer = function(container, removeButton, selectedClassName) {
	let items = container.children();

	items.click(function() {
		items.removeClass(selectedClassName);
		$(this).addClass(selectedClassName);
	});

	removeButton.click(function() {
		items.filter(function() {
			return $(this).hasClass(selectedClassName);
		}).each(function() {
			$(this).remove();
		});
	});
}

Util.encodeBoolean = function(b) {
	return ((b) ? "t" : "f").charCodeAt(0);
}

Util.deencodeBoolean = function(charCode) {
	if (charCode === "116") {
		return true;
	} else if (charCode === "102") {
		return false;
	} else {
		throw new Error("Things have gone horribly wrong");
	}
}

Util.generateMatchCode = function(allowAlternatives, allowRepeats, allowMultiMatch, matchFactor, matchInventory) {
	let code = "";
	code += Util.encodeBoolean(allowAlternatives);
	code += Util.encodeBoolean(allowRepeats);
	code += Util.encodeBoolean(allowMultiMatch);
	code += String(Math.round(matchFactor*100)).padStart(3, '0');
	matchInventory.forEach(function(item) {
		let itemId = item["item_id"];
		let variantId = item["variant_id"];
		let e1 = String(itemId).padStart(4, '0');
		let e2 = String(variantId).padStart(2, '0');
		code += e1;
		code += e2;
	});
	return code;
}

Util.parseMatchCode = function(codeRaw) {
	let code = codeRaw.trim();
	let allowAlternatives = Util.deencodeBoolean(code.slice(0, 3));
	let allowRepeats = Util.deencodeBoolean(code.slice(3, 6));
	let allowMultiMatch = Util.deencodeBoolean(code.slice(6, 9));
	let matchFactor = parseInt(code.slice(9, 12))/100;

	let itemVariants = [];
	for (let i = 0; i < (code.length - 12) / 6; i++) {
		let start = i*6+12;
		let itemId = parseInt(code.slice(start, start + 4));
		let variantId = parseInt(code.slice(start+4, start+4+2));
		itemVariants.push({
			"item_id": itemId,
			"variant_id": variantId
		});
	}

	return {
		"allow_alternative": allowAlternatives,
		"allow_repeats": allowRepeats,
		"allow_multimatch": allowMultiMatch,
		"match_factor": matchFactor,
		"item_variants": itemVariants
	};
}

Util.createItemVariantName = function(itemName, variantIconName) {
	return {
		"item_name": itemName,
		"icon_name": variantIconName
	};
}

Util.createDeveloperMatch = function(allowAlternatives, allowRepeats, allowMultiMatch, matchFactor, itemVariantNames) {
	let itemVariants = [];
	itemVariantNames.forEach(function(itemVariantName) {
		console.log(itemVariantName);
		itemVariants.push(Util.lookupItemVariantIndices(ItemsMetadata, itemVariantName["item_name"], itemVariantName["icon_name"]));
	});
	
	return {
		"allow_alternative": allowAlternatives,
		"allow_repeats": allowRepeats,
		"allow_multimatch": allowMultiMatch,
		"match_factor": matchFactor,
		"item_variants": itemVariants
	};
}

Util.lookupItemVariantIndices = function(metadata, itemName, variantIconName) {
	let item = null;
	let itemIndex = -1;
	for (let i = 0; i < metadata.length; i++) {
		let current = metadata[i];
		if (current[NAME_PROP] === itemName) {
			item = current;
			itemIndex = i;
			break;
		}
	}
	
	let variantIndex = -1;
	for (let i = 0; i < item[VARIANTS_PROP].length; i++) {
		let current = item[VARIANTS_PROP][i];
		if (current[VARIANT_ICON_FILE_PROP] == variantIconName) {
			variantIndex = i;
		}
	}
	
	return {
			"item_id": itemIndex,
			"variant_id": variantIndex
	};
}

Util.hasAlternatives = function(iconFileName) {
	return typeof ItemsAlternativesMetadata[ItemsAlternativesLookup[iconFileName]] !== "undefined";
}

Util.findAllAlternativeNames = function(iconFileName) {
	let alternatives = []
	let alternativesMetadata = ItemsAlternativesMetadata[ItemsAlternativesLookup[iconFileName]];

	if (typeof alternativesMetadata === "undefined") {
		return alternatives;
	}

	alternativesMetadata.forEach(function(alt) {
		let altItemIndex = alt["item_index"];
		let itemName = ItemsMetadata[altItemIndex][NAME_PROP];
		alt["variant_indices"].forEach(function(variantIndex) {
			let itemVariant = ItemsMetadata[altItemIndex]["variants"][variantIndex];
			itemVariant[VARIANT_NAMES_PROP].forEach(function(name) {
				alternatives.push({"item_name": itemName, "variant_name": name});
			});
		});
	});

	return alternatives;
}

const NAME_PROP = "name";
const VARIANTS_PROP = "variants";
const VARIANT_NAMES_PROP = "names";
const VARIANT_ICON_FILE_PROP = "iconFile";

var createItemMetadata = function(name, variants) {
	let item = {};

	item[NAME_PROP] = name;
	item[VARIANTS_PROP] = variants;

	return item;
}

var createItemVariantMetadata = function(names, iconFile) {
	let variant = {};

	variant[VARIANT_NAMES_PROP] = names;
	variant[VARIANT_ICON_FILE_PROP] = iconFile;

	return variant;
}

