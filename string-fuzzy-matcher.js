var StringFuzzyMatcher = function(matchFactorRaw) {
	const CHARACTER_MATCHED_MOD = 100;
	const FIRST_LAST_CHARACTER_COEFF = 0.1;
	const MATCH_STREAK_COEFF = 20;
	const CHARACTER_NOT_MATCHED_MOD = -75;
	const INCORRECT_PLACE_PER_MOD = -25;
	const EXTRA_CHARACTER_REPRESENTED_MOD = -25;
	const EXTRA_CHARACTER_NOT_REPRESENTED_MOD = -75;

	var matchFactor = matchFactorRaw;
	var logging = false;

	var getFirstCharacter = function(str) {
		return str.charAt(0);
	}

	var getLastCharacter = function(str) {
		return str.charAt(str.length - 1);
	}

	var scaleValue = function(val, scale) {
		return Math.round(val * scale);
	}

	var getFirstLastCharacterMod = function(str) {
		return scaleValue(CHARACTER_MATCHED_MOD * str.length, FIRST_LAST_CHARACTER_COEFF);
	}

	var getMaxScore = function(answer) {
		return (getFirstLastCharacterMod(answer) * 2) + (CHARACTER_MATCHED_MOD * answer.length);
	}

	// PUBLIC
	this.getMatchFactor = function() {
		return matchFactor;
	}

	this.setMatchFactor = function(newMatchFactor) {
		matchFactor = newMatchFactor;
	}

	this.setLogging = function(setTo) {
		logging = setTo;
	}

	this.matches = function(checkRaw, answerRaw) {
		let check = checkRaw.toLowerCase();
		let answer = answerRaw.toLowerCase();
		if (check === answer) {
			return true;
		}

		let score = 0;
		let updateScore = function(update, reason) {
			score += update;
			if (logging) {
				console.log(reason + " A change of " + update + " occured. The score is now " + score);
			}
		}

		// Check if the first and last character match
		if (getFirstCharacter(check) === getFirstCharacter(answer)) {
			updateScore(getFirstLastCharacterMod(answer), "First character matched!");
		}
		if (getLastCharacter(check) === getLastCharacter(answer)) {
			updateScore(getFirstLastCharacterMod(answer), "Last character matched!");
		}

		let charMatched = new Array(answer.length);
		charMatched.fill(false);

		let lastMatch = -1;
		let matchStreak = 0;
		let resetStreak = function() {
			if (matchStreak > 0) {
				updateScore(matchStreak * MATCH_STREAK_COEFF, "A streak of " + matchStreak + " achieved!");
			}
			lastMatch = -1;
			matchStreak = 0;
		}
		let updateStreak = function(newestMatchIndex) {
			if (newestMatchIndex - 1 === lastMatch || newestMatchIndex + 1 === lastMatch) {
				lastMatch = newestMatchIndex;
				matchStreak++;
				return true;
			}
			resetStreak();
			return false;
		}

		for (let i = 0; i < check.length; i++) {
			let checkChar = check.charAt(i);
			let matched = false;
			let indexMatched = -1;
			let represented = false;

			for (let j = 0; j < answer.length; j++) {
				let answerChar = answer.charAt(j);

				if (checkChar === answerChar) {
					represented = true;
					if (!charMatched[j]) {
						matched = true;
						indexMatched = j;
						break;
					}
				}
			}

			if (matched) {
				charMatched[indexMatched] = true;
				updateScore(CHARACTER_MATCHED_MOD, "Character was matched!");

				updateStreak(indexMatched);

				let placeDiff = Math.abs(indexMatched - i);
				if (placeDiff > 0) {
					updateScore(placeDiff * INCORRECT_PLACE_PER_MOD, "Match was " + placeDiff + " places off.");
				}
			} else {
				if (represented) {
					updateScore(EXTRA_CHARACTER_REPRESENTED_MOD, "An extra character existed but was represented.");
				} else {
					updateScore(EXTRA_CHARACTER_NOT_REPRESENTED_MOD, "An extra character existed and was NOT represented.");
				}
				resetStreak();
			}
		}

		for (let i = 0; i < charMatched.length; i++) {
			if (!charMatched[i]) {
				updateScore(CHARACTER_NOT_MATCHED_MOD, "Character not matched! (" + answer.charAt(i) + ")");
			}
		}

		let maxScore = getMaxScore(answer);
		let scoreToAchieve = maxScore * matchFactor;
		if (logging) {
			console.log("Max score is " + maxScore + ". Score to achieve is " + scoreToAchieve + ".");
		}

		return score >= scoreToAchieve;
	}
}

