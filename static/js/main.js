var showdown = require('showdown'),
    converter = new showdown.Converter();

var URL_FOR_WHITEBOARD_ITEMS = "/data";

var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var now = new Date();
var standup = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 24, 0);

// var URL_FOR_WHITEBOARD_ITEMS = "whiteboard_items.json";

//All the things that do work

var indexOfClass = function (elements, className) {
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (element.classList.contains(className)) {
            return i;
        }
    }
};

var advanceClassOrWrap = function (elements, className) {
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

var nextArticle = function () {
    var articles = document.querySelectorAll('article');

    advanceClassOrWrap(articles, 'current');
};

var getRandom = function (values) {
    var randomIndex = Math.floor(Math.random() * values.length);
    var value = values[randomIndex];

    return value;
};

var assignRandomBackground = function (selector, imageClasses) {
    var elements = document.querySelectorAll(selector);

    for (var i = 0; i < elements.length; i++) {
        var imageClass = getRandom(imageClasses);
        var element = elements[i];
        element.classList.add(imageClass);
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
    var date = articleData.date;

    // new faces don't have descriptions, so in this case show 'Welcome!' there
    if (articleType === 'New face' && description === null) {
        description = "Welcome!";
    }

    // create a new string using our template by inserting the values from this help
    var htmlWithContent = articleTemplate
        .replace("ARTICLE_TITLE", converter.makeHtml(title))
        .replace("ARTICLE_DESCRIPTION", converter.makeHtml(description))
        .replace("ARTICLE_CLASS", articleClass)
        .replace("ARTICLE_DATE", getFormattedArticleDate(date))
        .replace("ARTICLE_COUNT", `${index + 1} of ${data[articleType].length}`)
        .replace("ARTICLE_KIND", kind);

    return htmlWithContent;
}

function getFormattedArticleDate(date) {
    var myDate = date;
    myDate = myDate.split("-");
    var newDate = myDate[1] + "/" + myDate[2] + "/" + myDate[0];
    var articleDateObj = new Date(newDate);
    articleDate = articleDateObj.getTime();
    todayDate = new Date().getTime();
    timeDifference = articleDate - todayDate;
    days = Math.ceil(timeDifference / (86400 * 1000));
    formatted = "";

    switch (days) {
        case 0:
            formatted = "Today";
            break;
        case 1:
            formatted = "Tomorrow";
            break;
        default:
            formatted = dayOfWeek[articleDateObj.getDay()] + ', ' + formattedDate(articleDateObj);
            break;
    }
    return formatted;
}

function generateGroupQuestion(groupType, groupClass, haveOthers) {
    var groupTemplate = document.getElementById('groupQuestionTemplate').innerHTML;

    var htmlWithContent = groupTemplate
        .replace("ARTICLE_CLASS", groupClass)
        .replace("GROUP_QUESTION_TITLE", `${haveOthers ? 'Other ' : ''} ${groupType}`);

    return htmlWithContent;
}

function generateArticles(data, articleType, articleGroupSelector, articleClass) {
    var allArticlesHtml = "";

    if (data[articleType]) {
        // how many articles of this type do we have?
        var count = data[articleType].length;

        for (var i = 0; i < count; i++) {
            var articleHtml = generateArticle(data, articleType, i, articleClass);
            allArticlesHtml += articleHtml;
        }
    }

    allArticlesHtml += generateGroupQuestion(articleType, articleClass, !!data[articleType]);

    // find the article group to add this article to
    var articleGroup = document.querySelector(articleGroupSelector);
    // replace the article group's contents with this new article
    articleGroup.innerHTML = allArticlesHtml;
}

function setCurrentArticle() {
    var index = 0;
    if (atOrPastTime(standup)) {
        index = 1;
    }
    var currentArticle = document.querySelectorAll('article')[index];
    currentArticle.classList.add("current");

    if(index == 0) {
        setupCountdown();
    }
}

function generateAllArticles(data) {
    generateArticles(data, 'New Face', '.articleGroup.newFaces', 'newFaces');
    generateArticles(data, 'Help', '.articleGroup.helps', 'helps');
    generateArticles(data, 'Interesting', '.articleGroup.interestings', 'interestings');
    generateArticles(data, 'Event', '.articleGroup.events', 'events');
}

function populateContent(data) {
    generateAllArticles(data);
    setCurrentArticle();
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

function updateStandupDate() {
    document.getElementById('standupDate').innerHTML = formattedDate(new Date());
}

function formattedDate(date) {
    var day = date.getDate();
    return (day < 10 ? '0' + day : day) + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function atOrPastTime(standup) {
    var now = new Date();
    if (standup.getTime() - now.getTime() <= 0) {
        console.log('we are at or past the time!');
        return true;
    }

    return false;
}

function setupCountdown() {
    var now = new Date();
    var diff = standup.getTime() / 1000 - now.getTime() / 1000;
    var clock = $('.countNumbers').FlipClock(diff, {
        countdown: true
    });

    var interval = setInterval(function () {
        if (atOrPastTime(standup)) {
            clearInterval(interval);
            nextArticle();
        }
    }, 1000);

    updateStandupDate();
    setInterval(function () {
        updateStandupDate();
    }, 1000 * 60 * 60);
}

function init() {
    document.addEventListener("keypress", nextArticle);
    getWhiteboardItemsAndPopulateContent();
}

$(document).ready(function () {
    init();
});


// how do we identify which article should be the first one with current?






















