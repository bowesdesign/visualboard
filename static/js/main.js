var showdown = require('showdown'),
    converter = new showdown.Converter();
converter.setOption('simpleLineBreaks', true);

var standupDate;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var currentIndex = -1;
var lastGroupType = null;

function getNextIndex(i, articles) {
    return i >= articles.length - 1 ? 0 : i + 1;
}

function getPrevIndex(i, articles) {
    return (i ? i : articles.length) - 1;
}

function updateArticleHeader(animateTitle) {
    var $header = $('.article-header');
    var $current = $('.current');
    var $dotsContainer = $header.find('.dots-container');
    var articleType = $current.data('type');
    var articleCount = parseFloat($current.data('num'));
    var articleIndex = parseFloat($current.data('index'));

    if($dotsContainer.find('div').length != articleCount){
        $dotsContainer.html('');
        for(var i = 0; i < articleCount; i++){
            $dotsContainer.append('<div class="dot"></div>');
        }
    }

    $dotsContainer.toggleClass('single',articleCount == 1);

    $dotsContainer.find('.dot--full').removeClass('dot--full');
    $dotsContainer.find('.dot').eq(articleIndex).addClass('dot--full');

    $header.toggleClass('article-header--active',articleCount > 0);
    $header.find('h3').html(articleType);
}

function changeCurrentArticle(mover) {
    var articles = $('article');
    var sections = ['events', 'interestings', 'helps', 'newFaces', 'countdown', 'clap'];
    var match = false;
    var animateTitle = false;
    articles.each(function (i) {
        if ($(this).hasClass('current') && !match) {
            var newIndex = mover(i, articles);
            var newCurrent = articles.eq(newIndex);
            var direction = newIndex - currentIndex;
            var group = newCurrent.closest('.articleGroup');
            var groupType = group.attr("class").split(' ')[1];
            var switchedType = false;
            sections.map(function (s) {
                $('body').toggleClass('section--' + s, groupType == s);
                if(groupType == s){
                    if(groupType != lastGroupType){
                        lastGroupType = groupType;
                        switchedType = true;
                    }
                }
            });
            $('body').toggleClass('moveRight', direction > 0);
            $('body').toggleClass('moveLeft', direction < 0);
            $(this).removeClass('current').addClass('previous');
            newCurrent.addClass('current');
            animateTitle = parseFloat(newCurrent.data('num')) > 0;
            currentIndex = newIndex;
            match = true;
        } else {
            $(this).removeClass('previous');
        }
    });
    updateArticleHeader(animateTitle);
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
        .replace("ARTICLE_CLASS", articleClass)
        .replace("ARTICLE_KIND", kind)
        .replace("ARTICLE_COUNT", data[articleType].length)
        .replace("ARTICLE_INDEX", index)
        .replace("ARTICLE_DATE", getFormattedArticleDate(date))
        .replace("ARTICLE_AUTHOR", author);

    var descriptionHtml = converter.makeHtml(description);
    var imgTagRegex = /<img src=".+" alt=".*" \/>/;
    var imgTag = descriptionHtml.match(imgTagRegex);

    if (imgTag) {
        var imgUrl = imgTag[0].split('src="')[1].split('"')[0];

        return htmlWithContent
            .replace("ARTICLE_DESCRIPTION", descriptionHtml.replace(imgTagRegex, ''))
            .replace("ARTICLE_IMAGE_STYLE", "background-image: url(" + imgUrl + ");");
    } else {
        return htmlWithContent
            .replace("ARTICLE_DESCRIPTION", descriptionHtml)
            .replace("ARTICLE_IMAGE_STYLE", "display: none;");
    }
}

function makeDots(count, active) {
    var html = '';
    if (count > 1) {
        for (var i = 1; i <= count; i++) {
            html += '<div class="' + (i === active ? 'full' : 'empty') + '-circle"></div>';
        }
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
        .replace("GROUP_QUESTION_TITLE", (haveOthers ? 'Other ' : '') + ' ' + groupType);

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
    setWelcomeScreen();
}

function setStandupTime(startTime) {
    var timeParts = startTime.split(':');
    var hours = timeParts[0];
    var minutes = timeParts[1].slice(0, 2);
    var meridian = timeParts[1].slice(2, 4);

    standupDate = new Date();
    standupDate.setHours(+hours + (meridian === 'pm' ? 12 : 0));
    standupDate.setMinutes(minutes);
    standupDate.setSeconds(0);
    standupDate.setMilliseconds(0);
}

function populateMetadata(data) {
    $('.clap h1').text(data.closing_message);
    setStandupTime(data.start_time_string);
}

function showWelcomeMessage() {
    var countDownArticle = $('.countdown .titleCard');
    countDownArticle.addClass('welcomeMessage');

    // var sections = $('.countdown section');
    // sections.css('display', 'none');
    // sections.eq(1).css('display', 'flex');
}

function setWelcomeScreen() {
    if (atOrPastTime()) {
        showWelcomeMessage();
    } else {
        setupCountdown();
    }
}

function getWhiteboardItemsAndPopulateContent() {
    var standupUrl = '/standups' + (location.pathname === '/' ? '/11' : location.pathname);
    var itemsUrl = standupUrl + '/items';

    $.getJSON(standupUrl, function (data) {
        populateMetadata(data);
        $.getJSON(itemsUrl, populateContent);
    });
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
    if (standupDate.getTime() - now.getTime() <= 0) {
        return true;
    }

    return false;
}

function setupCountdown() {
    var now = new Date();
    var diff = standupDate.getTime() / 1000 - now.getTime() / 1000;
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
    audio.addEventListener('ended', function () {
        loopsRemaining--;
        if (loopsRemaining) {
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
