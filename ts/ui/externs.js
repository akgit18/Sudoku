/**
 * @externs
 */

/**
 * @const
 */
var Translator = {};

/**
 * @param {{sourceLanguage: string, targetLanguage: string}} options 
 * @return {!Promise<string>}
 */
Translator.availability = function (options) {};

/**
 * @param {{sourceLanguage: string, targetLanguage: string}} options 
 * @return {!Object} A new Translator service instance.
 */
Translator.create = function(options) {};

/**
 * @constructor
 * @param {!string} language
 * @return {!Intl.Locale}
 */
Intl.Locale = function(language) {};

/**
 * @type {!string}
 */
Intl.Locale.prototype.language;

/**
 * @type {string|undefined}
 */
Intl.Locale.prototype.script;

/**
 * @type {!Array<string>}
 */
navigator.languages;