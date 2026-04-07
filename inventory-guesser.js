var InventoryGuesser = function(getItemNames, getItemIconFileName, swapForAlternative, metadata, alternativesMetadata) {
	var stringMatcher = function(a, b) {return a===b;}
	var multiMatch = false;
	var inventory = [];
	var isMatched = [];
	var alternatives = true;
	var matchCode = "";

	// HELPERS

	/*
	* Modifies the given array by removing the element at the given index.
	*/
	var removeIndexFromArray = function(index, array) {
		// Uses the 'splice' function, which splices out a given number of
		//  elements from the array (in our case '1'), starting at 'index'.
		array.splice(index, 1);
	}

	/*
	* Creates a shallow copy of the given array
	*/
	var copyArray = function(array) {
		// A "clever" way of array copy by using the 'map' function.
		//  Map has it roots in mathematics and functional programming.
		//  In this case it "maps" values from the given array to values
		//  in a newly created array by first passing it through a transforming
		//  function, except our transforming function (x) => x
		//  is just the identity function. This effectively maps each value
		//  in the given array to itself in the newly created array.
		//  Thus a copy.
		return array.map((x) => x);
	}

	// PUBLIC
	this.guess = function(aGuess) {
		let matchedIndices = [];

		for (let i = 0; i < inventory.length; i++) {
			if (isMatched[i]) {
				continue;
			}

			let itemNames = getItemNames(inventory[i]);
			let anyMatched = false;
			itemNames.forEach(function(e, i, arr) {
				anyMatched = anyMatched || stringMatcher.matches(aGuess, e);
			});
			if (!anyMatched && alternatives) {
				let iconFileName = getItemIconFileName(inventory[i]);
				let alternatives = ItemsAlternativesMetadata[ItemsAlternativesLookup[iconFileName]];
				if (typeof alternatives !== "undefined") {
					alternatives.forEach(function(alt) {
						if (anyMatched) {
							return;
						}
						let altItemIndex = alt["item_index"];
						alt["variant_indices"].forEach(function(variantIndex) {
							if (anyMatched) {
								return;
							}
							let itemVariant = metadata[altItemIndex]["variants"][variantIndex];
							itemVariant[VARIANT_NAMES_PROP].forEach(function(name) {
								if (!anyMatched) {
									if (stringMatcher.matches(aGuess, name)) {
										anyMatched = true;
										swapForAlternative(i, metadata[altItemIndex][NAME_PROP], itemVariant);
										inventory[i] = itemVariant;
									}
								}
							});
						})
					});
				}
			}

			if (anyMatched) {
				isMatched[i] = true;
				matchedIndices.push(i);

				if (!multiMatch) {
					break;
				}
			}
		}

		return matchedIndices;
	}

	this.endGame = function() {
		let unmatchedIndices = [];

		for (let i = 0; i < inventory.length; i++) {
			if (isMatched[i]) {
				continue;
			}

			isMatched[i] = true;
			unmatchedIndices.push(i);
		}

		return unmatchedIndices;
	}

	this.hasBeenMatched = function(index) {
		return isMatched[index];
	}

	this.allHasMatched = function() {
		for (let i = 0; i < isMatched.length; i++) {
			if (!isMatched[i]) {
				return false;
			}
		}
		return true;
	}

	this.getCurrentInventory = function() {
		return copyArray(inventory);
	}

	this.isAllowAlternatives = function() {
		return alternatives;
	}

	this.getMatchCode = function() {
		return matchCode;
	}

	this.newGame = function(numberOfItemsRaw, allowAlternatives, allowRepeats, allowMultiMatch, newStringMatcher, predefinedItems) {
		let numberOfItems = Math.min(numberOfItemsRaw, 28);

		let usedIndexes = [];

		let tempInventory = [];
		let chosenItemVariants = [];

		let chooseRandomIndex = function() {
			let chosen = Util.randomIntInRange(0, metadata.length - 1);

			if (!allowRepeats) {
				while (usedIndexes.includes(chosen)) {
					chosen = Util.randomIntInRange(0, metadata.length - 1);
				}
			}

			usedIndexes.push(chosen);
			return chosen;
		}

		if (typeof predefinedItems !== "undefined" && predefinedItems.length > 0) {
			predefinedItems.forEach(function(itemMetadata) {
				let itemId = itemMetadata["item_id"];
				let variantId = itemMetadata["variant_id"];

				let item = metadata[itemId];
				let variant = item[VARIANTS_PROP][variantId];

				tempInventory.push(variant);
				chosenItemVariants.push({"item_id": itemId, "variant_id": variantId});
			});
		} else {
			for (let i = 0; i < numberOfItems; i++) {
				let chosen = chooseRandomIndex();
				let item = metadata[chosen];
				let chosenVariant = (item[VARIANTS_PROP].length > 1) ? Util.randomIntInRange(0, item[VARIANTS_PROP].length - 1) : 0;
				let variant = item[VARIANTS_PROP][chosenVariant];

				tempInventory.push(variant);
				chosenItemVariants.push({"item_id": chosen, "variant_id": chosenVariant});
			}
		}

		//console.log(tempInventory);
		console.log(chosenItemVariants);

		if (typeof newStringMatcher !== "undefined") {
			stringMatcher = newStringMatcher;
		}

		matchCode = Util.generateMatchCode(allowAlternatives, allowRepeats, allowMultiMatch, newStringMatcher.getMatchFactor(), chosenItemVariants);

		inventory = tempInventory;
		isMatched = new Array(inventory.length);
		isMatched.fill(false);
		alternatives = allowAlternatives;
		multiMatch = allowMultiMatch;

		return chosenItemVariants;
	}
}

