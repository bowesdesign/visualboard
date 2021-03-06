var showdown = require('showdown'),
    converter = new showdown.Converter();
converter.setOption('simpleLineBreaks', true);

var standupDate;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var currentIndex = -1;
var lastGroupType = null;
var createdGroupTitles = {};

function getNextIndex(i, articles) {
    return i >= articles.length - 1 ? 0 : i + 1;
}

function getPrevIndex(i, articles) {
    return (i ? i : articles.length) - 1;
}

function updateArticleHeader(animateTitle, newCurrent, oldCurrent) {
    if (animateTitle) {
        var $group = newCurrent.closest('.articleGroup');
        var $groupTitle = $group.find('.groupTitle');
        var groupType = newCurrent.data('type');
        var newArticleCount = parseFloat(newCurrent.data('num'));
        if(parseFloat($group.data('num')) > 0){
            newArticleCount = parseFloat($group.data('num'));
        }
        if (!createdGroupTitles[groupType]) {
            createdGroupTitles[groupType] = true;
            $group.append('<div class="groupTitle flex-container"><h1 class="alignCenter question"> ' + groupType + 's<span class="count"><span>' + newArticleCount + '</span></span></h1></div>');
            $groupTitle = $group.find('.groupTitle');
        }
        oldCurrent.removeClass('current').addClass('previous');
        $groupTitle.css({opacity: 0});

        setTimeout(function () {
            $groupTitle.addClass('animate');
            $groupTitle.animate({opacity: 1}, 500, function () {
                setTimeout(function () {
                    newCurrent.addClass('current');
                    $groupTitle.animate({opacity: 0}, 300, function () {
                        updateArticleHeader(false);
                        $groupTitle.removeClass('animate');
                    })
                }, 580);
            });
        }, 450);
    } else {
        var $header = $('.article-header');
        var $current = $('.current');
        var $dotsContainer = $header.find('.dots-container');
        var articleType = $current.data('type');
        var articleCount = parseFloat($current.data('num'));
        var articleIndex = parseFloat($current.data('index'));
        if ($dotsContainer.find('div').length != articleCount) {
            $dotsContainer.html('');
            for (var i = 0; i < articleCount; i++) {
                $dotsContainer.append('<div class="dot"></div>');
            }
        }
        $dotsContainer.toggleClass('single', articleCount == 1);
        $dotsContainer.find('.dot--full').removeClass('dot--full');
        $dotsContainer.find('.dot').eq(articleIndex).addClass('dot--full');
        $header.toggleClass('article-header--active', articleCount > 0);
        $header.find('h3').html(articleType);

    }
}

function changeCurrentArticle(mover) {
    var articles = $('article');
    var sections = ['events', 'interestings', 'helps', 'newFaces', 'countdown', 'clap'];
    var match = false;
    var animateTitle = false;
    var newCurrent = null;
    var oldCurrent = null;
    $('.previous').removeClass('previous');
    articles.each(function (i) {
        if ($(this).hasClass('current') && !match) {
            var newIndex = mover(i, articles);
            newCurrent = articles.eq(newIndex);
            oldCurrent = $(this);
            var direction = newIndex - currentIndex;
            var group = newCurrent.closest('.articleGroup');
            var groupType = group.attr("class").split(' ')[1];
            var switchedType = false;

            sections.map(function (s) {
                $('body').toggleClass('section--' + s, groupType == s);
                if (groupType == s) {
                    if (groupType != lastGroupType) {
                        lastGroupType = groupType;
                        switchedType = true;
                    }
                }
            });

            $('body').toggleClass('moveRight', direction > 0);
            $('body').toggleClass('moveLeft', direction < 0);

            animateTitle = direction > 0 && parseFloat(newCurrent.data('num')) > 0 && newCurrent.data('index') == '0';

            if (!animateTitle) {
                oldCurrent.removeClass('current').addClass('previous');
                newCurrent.addClass('current');
            }

            currentIndex = newIndex;
            match = true;
            return;
        }
    });
    updateArticleHeader(animateTitle, newCurrent, oldCurrent);
}

function generateArticle(data, articleType, index, articleClass, template) {
    // Find our template for all the article contents
    var articleTemplate = document.getElementById(template).innerHTML;

    // get the data for the requested type and position
    var articleData = data[articleType][index];

    // get the title and description
    var title = articleData.title;
    var description = articleData.description;
    var kind = articleData.kind;
    var date = articleData.date;
    var author = articleData.author ? 'Posted by ' + articleData.author : '';
    var count = data[articleType].length;

    if(articleType == 'Event'){
        count = 1;
        for(var i=0;i<data[articleType].length;i++){
            if(!data[articleType][i].upcoming){
                count++;
            }
        }
    }

    // new faces don't have descriptions, so in this case show 'Welcome!' there
    if (articleType === 'New face' && description === null) {
        description = "Welcome!";
    }

    // create a new string using our template by inserting the values from this
    var htmlWithContent = articleTemplate
        .replace("ARTICLE_TITLE", title)
        .replace("ARTICLE_CLASS", articleClass)
        .replace("ARTICLE_KIND", kind)
        .replace("ARTICLE_COUNT", count)
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
    var upcomingEventHtml = "";
    var upcomingEventTemplate = document.getElementById('upcomingEventTemplate');
    var eventCount = 0;
    var upcomingEventCount = 0;

    if (data[articleType]) {
        // how many articles of this type do we have?
        var count = data[articleType].length;

        for (var i = 0; i < count; i++) {
            var maxEventTime = 604800000 * 2; // two weeks
            // check if event date is over max event time
            if(articleType == 'Event'){
                var articleTimestamp = new Date(data[articleType][i].date).getTime();
                var todayTimestamp = new Date().getTime();
                var timeFromNow = (articleTimestamp - todayTimestamp);
                data[articleType][i].upcoming = (timeFromNow > maxEventTime);
                if(data[articleType][i].upcoming){
                    upcomingEventCount++;
                }
            } else {
                allArticlesHtml += generateArticle(data, articleType, i, articleClass,'articleTemplate');
            }
        }
    }

    // find the article group to add this article to
    var articleGroup = document.querySelector(articleGroupSelector);

    if (articleType == 'Event') {
        for (var i = 0; i < count; i++) {
            if(data[articleType][i].upcoming && upcomingEventCount > 1){
                upcomingEventHtml += generateArticle(data, articleType, i, articleClass,'upcomingEventTemplate');
            } else {
                eventCount++;
                allArticlesHtml += generateArticle(data, articleType, i, articleClass,'articleTemplate');
            }
        }
        articleGroup.dataset.num = count;
    }

    // replace the article group's contents with this new article
    articleGroup.innerHTML = allArticlesHtml;

    if (upcomingEventHtml) {
        var upcomingEventsTemplate = document.getElementById('upcomingEventsTemplate').innerHTML;
        var upcomingEventContent = upcomingEventsTemplate
            .replace("UPCOMING_EVENTS", upcomingEventHtml)
            .replace("ARTICLE_KIND", 'Event')
            .replace("ARTICLE_COUNT", eventCount+1)
            .replace("ARTICLE_INDEX", eventCount);

        articleGroup.innerHTML += upcomingEventContent;

    }

    articleGroup.innerHTML += generateGroupQuestion(articleType, articleClass, !!data[articleType]);

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
    $('.clap h1').text(data.closing_message ? data.closing_message : 'CLAP!');
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
