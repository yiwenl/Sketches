// insertString.js

'use strict';

module.exports = function insertString(mStr, mStrToInsert, mIndex) {
	const sBefore = mStr.substring(0, mIndex);
	const sAfter = mStr.substring(mIndex);

	return `${sBefore}${mStrToInsert}${sAfter}`;
}