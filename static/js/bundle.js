/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

throw new Error("Module build failed: ModuleParseError: Module parse failed: /Users/pivotal/workspace/visualboard/static/img/newFaces/nf-01.jpg Unexpected character '�' (1:0)\nYou may need an appropriate loader to handle this file type.\n(Source code omitted for this binary file)\n    at doBuild (/Users/pivotal/workspace/visualboard/node_modules/webpack/lib/NormalModule.js:296:19)\n    at runLoaders (/Users/pivotal/workspace/visualboard/node_modules/webpack/lib/NormalModule.js:206:11)\n    at /Users/pivotal/workspace/visualboard/node_modules/loader-runner/lib/LoaderRunner.js:370:3\n    at iterateNormalLoaders (/Users/pivotal/workspace/visualboard/node_modules/loader-runner/lib/LoaderRunner.js:211:10)\n    at /Users/pivotal/workspace/visualboard/node_modules/loader-runner/lib/LoaderRunner.js:202:4\n    at /Users/pivotal/workspace/visualboard/node_modules/enhanced-resolve/lib/CachedInputFileSystem.js:62:14\n    at _combinedTickCallback (internal/process/next_tick.js:73:7)\n    at process._tickCallback (internal/process/next_tick.js:104:9)");

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__scss_main_scss__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__scss_main_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__scss_main_scss__);


var URL_FOR_WHITEBOARD_ITEMS = "/data";
// var URL_FOR_WHITEBOARD_ITEMS = "whiteboard_items.json";

//All the things that do work

var indexOfClass = function(elements, className) {
	for(var i=0; i<elements.length; i++){
		var element = elements[i];

		if (element.classList.contains(className)) {
			return i;
		}
	}
};

var advanceClassOrWrap = function(elements, className){
	var index = indexOfClass(elements, className);
	
	var nextElement;
	var isLastElement = index === elements.length - 1;

	if (isLastElement) {
		nextElement = elements[0];
	} 
	else {
		nextElement = elements[index + 1];
	}

	var currentElement = elements[index];
	
	currentElement.classList.remove(className);
	nextElement.classList.add(className);
};

var nextArticle = function(){
	var articles = document.querySelectorAll('article');

	advanceClassOrWrap(articles, 'current');
};

var getRandom = function(values){
	var randomIndex = Math.floor(Math.random() * values.length);
	var value = values[randomIndex];

	return value;
};

var assignRandomBackground = function(selector, imageClasses){
	var elements = document.querySelectorAll(selector);

	for (var i=0; i<elements.length; i++){
		var imageClass = getRandom(imageClasses);
		var element = elements[i];
		element.classList.add(imageClass);
	}
};

var displayArticleCount = function(articleGroup){
	var articles = articleGroup.querySelectorAll('article');
	for (var i=0; i<articles.length; i++){
		var article = articles[i];
		var articleCountSpan = article.querySelectorAll('.articleCount')[0];
		articleCountSpan.innerHTML = i+1 + ' of ' + articles.length;
	}
	
};

var initAllArticleCounts = function(){
	var articleGroups = document.querySelectorAll('.articleGroup');
	for (var i=0; i<articleGroups.length; i++){
		var g = articleGroups[i];
		displayArticleCount(g);
	}
	
};

function generateArticle(data, articleType, index, articleClass) {
	// Find our template for all the article contents
	var articleTemplate = document.getElementById('articleTemplate').innerHTML;

	// get the data for the requested type and position
	var articleData = data[articleType][index];
	
	// get the title and description
	var title = articleData.title;
	var description = articleData.description;
	var kind = articleData.kind;

	// new faces don't have descriptions, so in this case show 'Welcome!' there
	if (articleType === 'New face' && description === null) {
		description = "Welcome!";
	}

	// create a new string using our template but insertign the values from this help
	var htmlWithContent = articleTemplate.
		replace("ARTICLE_TITLE", title).
		replace("ARTICLE_DESCRIPTION", description)
		.replace("ARTICLE_CLASS", articleClass)
		.replace("ARTICLE_KIND", kind);
	// "<p>the title</p> <p>the description</p>"

		// <div class="articleGroup helps"></div>

	return htmlWithContent;
}

function generateArticles(data, articleType, articleGroupSelector, articleClass) {
	// if we don't have any of the type requested, dont generate anything
	if (typeof data[articleType] === "undefined") {
		return;
	}

	// how many articles of this type do we have?
	var count = data[articleType].length;

	var allArticlesHtml = "";
	for (var i=0; i<count; i++) {
		var articleHtml = generateArticle(data, articleType, i, articleClass);	
		allArticlesHtml += articleHtml;
	}

	// find the article group to add this article to
	var articleGroup = document.querySelector(articleGroupSelector);
	// replace the article group's contents with this new article
	articleGroup.innerHTML = allArticlesHtml;
}

function setFirstArticleAsCurrent() {
	var firstArticle = document.querySelectorAll('article')[0];
	firstArticle.classList.add("current");
}

function generateAllArticles(data) {
	generateArticles(data, 'New face', '.articleGroup.newFaces', 'newFaces');
	generateArticles(data, 'Help', '.articleGroup.helps', 'helps');
	generateArticles(data, 'Interesting', '.articleGroup.interestings', 'interestings');
	generateArticles(data, 'Event', '.articleGroup.events', 'events');
}

function populateContent(data) {
	generateAllArticles(data);
	initAllArticleCounts();
	setFirstArticleAsCurrent();
	assignBackgrounds();
}

function getWhiteboardItemsAndPopulateContent() {	
	$.getJSON(URL_FOR_WHITEBOARD_ITEMS, populateContent);
}

function assignBackgrounds() {
	assignRandomBackground('article.newFaces aside', ['image-1', 'image-2', 'image-3']);
	assignRandomBackground('article.helps aside', ['image-1', 'image-2', 'image-3']);
	assignRandomBackground('article.interestings aside', ['image-1', 'image-2', 'image-3']);
	assignRandomBackground('article.events aside', ['image-1', 'image-2', 'image-3']);
}

function init() {
	document.addEventListener("keypress", nextArticle);
	getWhiteboardItemsAndPopulateContent();
}

init();


// how do we identify which article should be the first one with current?
























/***/ })
/******/ ]);