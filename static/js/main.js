var showdown = require('showdown'),
    converter = new showdown.Converter();
converter.setOption('simpleLineBreaks', true);

var URL_FOR_WHITEBOARD_ITEMS = "/data";

var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var now = new Date();
var standup = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 6, 0);

// var URL_FOR_WHITEBOARD_ITEMS = "whiteboard_items.json";

function getNextIndex(i, articles) {
    return i >= articles.length - 1 ? 0 : i + 1;
    // if(i === articles.length - 1) {
    //     return 0;
    // } else {
    //     return i + 1;
    // }
}

function getPrevIndex(i, articles) {
    return (i ? i : articles.length) - 1;
    // if(i === 0) {
    //     return articles.length - 1;
    // } else {
    //     return i - 1;
    // }
}

function changeCurrentArticle(mover) {
    var articles = $('article');
    articles.each(function (i) {
        if ($(this).hasClass('current')) {
            var newCurrent = articles.eq(mover(i, articles));
            $(this).removeClass('current');
            newCurrent.addClass('current');
            return false;
        }
    });
}

function getRandom(values) {
    var randomIndex = Math.floor(Math.random() * values.length);
    var value = values[randomIndex];

    return value;
}

function assignRandomBackground(selector, imageClasses) {
    var elements = document.querySelectorAll(selector);

    for (var i = 0; i < elements.length; i++) {
        var imageClass = getRandom(imageClasses);
        var element = elements[i];
        element.classList.add(imageClass);
    }
}

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
    var author = articleData.author ? 'Posted by ' + articleData.author : '';

    // new faces don't have descriptions, so in this case show 'Welcome!' there
    if (articleType === 'New face' && description === null) {
        description = "Welcome!";
    }

    // create a new string using our template by inserting the values from this
    var htmlWithContent = articleTemplate
        .replace("ARTICLE_TITLE", title)
        .replace("ARTICLE_DESCRIPTION", converter.makeHtml(description))
        .replace("ARTICLE_CLASS", articleClass)
        .replace("ARTICLE_DATE", getFormattedArticleDate(date))
        // .replace("ARTICLE_COUNT", `${index + 1} of ${data[articleType].length}`)
        .replace("ARTICLE_KIND", kind)
        .replace("ARTICLE_DOTS", makeDots(data[articleType].length, index+1))
        .replace("ARTICLE_AUTHOR", author);

    return htmlWithContent;
}

function makeDots(count, active) {
    var html = '';
    for(var i = 1; i <= count; i++) {
        html += `<div class="${i === active ? 'full' : 'empty'}-circle"></div>`;
    }
    return html;
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
    var currentArticle = document.querySelectorAll('article')[0];
    currentArticle.classList.add("current");
}

function generateAllArticles(data) {
    generateArticles(data, 'New face', '.articleGroup.newFaces', 'newFaces');
    generateArticles(data, 'Help', '.articleGroup.helps', 'helps');
    generateArticles(data, 'Interesting', '.articleGroup.interestings', 'interestings');
    generateArticles(data, 'Event', '.articleGroup.events', 'events');
}

function populateContent(data) {
    generateAllArticles(data);
    setCurrentArticle();
    assignBackgrounds();
    setWelcomeScreen();
}

function showWelcomeMessage() {
    let sections = $('.countdown section');
    sections.css('display', 'none');
    sections.eq(1).css('display', 'flex');
}

function setWelcomeScreen() {
    if (atOrPastTime()) {
        showWelcomeMessage();
    } else {
        setupCountdown();
    }
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

function atOrPastTime() {
    var now = new Date();
    if (standup.getTime() - now.getTime() <= 0) {
        return true;
    }

    return false;
}

function setupCountdown() {
    document.querySelectorAll('.countdown section')[0].style.display = "flex";
    var now = new Date();
    var diff = standup.getTime() / 1000 - now.getTime() / 1000;
    $('.countNumbers').FlipClock(diff, {countdown: true});

    var interval = setInterval(function () {
        if (atOrPastTime()) {
            clearInterval(interval);
            showWelcomeMessage();
            playDing();
        }
    }, 1000);

    updateStandupDate();
    setInterval(function () {
        updateStandupDate();
    }, 1000 * 60 * 60);
}

function playDing() {
    var audio = new Audio('../mp3/shipbell.mp3');

    var loopsRemaining = 2;
    audio.addEventListener('ended', function() {
        loopsRemaining--;
        if(loopsRemaining) {
            this.play();
        }
    });
    audio.play();
}

function init() {
    document.addEventListener('keyup', function (event) {
        if (['ArrowRight', 'Space', 'ArrowDown', 'Enter', 'NumpadEnter'].indexOf(event.code) > -1) {
            changeCurrentArticle(getNextIndex);
        } else if (['ArrowLeft', 'Delete', 'ArrowUp', 'Backspace'].indexOf(event.code) > -1) {
            changeCurrentArticle(getPrevIndex);
        }
    });
    getWhiteboardItemsAndPopulateContent();
}

$(document).ready(function () {
    init();
});
