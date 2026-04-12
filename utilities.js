var Util = Util || {};

Util.Timer = function(timeSeconds, onSecondCallback) {
	var currentTimeSeconds = timeSeconds;
	var interval = null;

	this.start = function() {
		if (currentTimeSeconds <= 0) {
			return;
		}

		interval = setInterval(function() {
			currentTimeSeconds -= 1;
			onSecondCallback(currentTimeSeconds);
			if (currentTimeSeconds <= 0) {
				clearInterval(interval);
				interval = null;
			}
		}, 1000);
	}

	this.stop = function() {
		clearInterval(interval);
		interval = null;
	}

	this.getTime = function() {
		return currentTimeSeconds;
	}
}

Util.Stopwatch = function(onSecondCallback) {
	var currentTimeSeconds = 0;
	var interval = null;

	this.start = function() {
		interval = setInterval(function() {
			currentTimeSeconds += 1;
			onSecondCallback(currentTimeSeconds);
		}, 1000);
	}

	this.stop = function() {
		clearInterval(interval);
		interval = null;
	}

	this.getTime = function() {
		return currentTimeSeconds;
	}
}

Util.parseTimeStringToSeconds = function(timeString) {
	let pattern = /^([0-9]+:){0,2}[0-9]+$/;
	
	if (!pattern.test(timeString)) {
		console.log("Invalid time string '" + timeString + "'");
		return 0;
	}
	
	let split = timeString.split(":");
	
	let totalSeconds = 0;
	if (split.length >= 3) {
		let hours = parseInt(split[0]);
		totalSeconds += hours * 60 * 60;
	}
	if (split.length >= 2) {
		let minutesIndex = split.length - 2;
		let minutes = parseInt(split[minutesIndex]);
		totalSeconds += minutes * 60;
	}
	let secondsIndex = split.length - 1;
	let seconds = parseInt(split[secondsIndex]);
	totalSeconds += seconds;
	
	return totalSeconds;
}

Util.formatSecondsToTimeString = function(seconds) {
	let secondsLeft = seconds;
	
	let hours = Math.floor(secondsLeft/(60*60));
	secondsLeft = secondsLeft % (60 * 60);
	
	let minutes = Math.floor(secondsLeft/60);
	secondsLeft = secondsLeft % 60;
	
	let hoursString = (hours > 0) ? String(hours) + ':' : "";
	let minutesString = String(minutes).padStart((hours.length > 0) ? 2 : 0, '0') + ':';
	let secondsString = String(secondsLeft).padStart(2, '0');
	
	return hoursString + minutesString + secondsString;
}

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

Util.scaleNumberToRange = function(value, min, max) {
	return Math.floor(value * (max - min + 1)) + min;
}

Util.MAX_SEED_VALUE = 4294967296;
Util.randomNumberGenerator = function(seed) {
	// Implemenation of Mulberry32
	let prng = function() {
		let t = seed += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / Util.MAX_SEED_VALUE;
	}
	
	// Go past the first 20 iterations because
	// predictable sequences occur at lower iterations for some seeds
	for (let goPast = 0; goPast < 20; goPast++) {
		prng();
	}
	
	return prng;
}

Util.RANDOM_STRING_ALLOWED_CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
Util.calculateNumberFromString = function(str) {
	let concat = "";
	for (let i = 0; i < str.length; i++) {
		concat += str.codePointAt(i);
	}
	let rawSeed = BigInt(concat);
	let fixedSeed = rawSeed % BigInt(Util.MAX_SEED_VALUE);
	return Number(fixedSeed);
}

Util.generateRandomString = function(length) {
	let g = "";
	for (let i = 0; i < length; i++) {
		let rand = Util.randomIntInRange(0, Util.RANDOM_STRING_ALLOWED_CHARACTERS.length);
		g += Util.RANDOM_STRING_ALLOWED_CHARACTERS.charAt(rand);
	}
	return g;
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

	return alternatives.sort((a, b) => a.item_name.localeCompare(b.item_name));
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

