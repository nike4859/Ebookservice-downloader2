//getCurrentUrl();

function getCurrentUrl() {
    //callback send document
    console.log(document);
    chrome.extension.sendRequest({
        doc: document
    });
}

function getCurrentUrl2() {
    var bookName, pages, src, src1, src2, audioSrc;
    var flag = true;

    var arrayName = document.querySelectorAll("div.top_bookname"); //page combobox
    //console.log(arrayName);
    if (arrayName.length != 0) {
        bookName = arrayName["0"].innerText;
        console.log(bookName);
    } else {
        flag = false;
        alert("找不到書本");
    }

    var arrayOpts = document.querySelectorAll("option"); //page combobox
    //console.log(arrayOpts.length);
    if (arrayOpts.length != 0) {
        pages = (arrayOpts.length - 1) * 2; //calculate  amount of pages
        console.log("Page length:" + pages);
    } else {
        flag = false;
        alert("找不到書碼");
    }

    var arrayLis = document.querySelectorAll("li img"); //page
    //console.log(arrayLis);
    if (arrayLis.length != 0) {
        src = arrayLis[0].src //retrive first img url
        console.log("Parsing url: " + src);
    } else {
        flag = false;
        alert("找不到內容");
    }

    //chack page of url
    if (flag) {
        src1 = src.substring(0, 38); //head
        src2 = src.substring(39); //tail
        if (src1.charAt(src1.length - 1) != "=" || 　src2.charAt(0) != "&") {
            flag = false;
            console.log("src1:" + src1);
            console.log("src2:" + src2);
            alert("頁碼不正確");
        }
    }

    //0-39 40-
    //http://voler.ebook4rent.tw/book/audio?p=5&code=3&bookId=xxx&token=xxx&bookToken=xxx
    var audioTmp = document.querySelectorAll("div audio"); //mp3
    if (audioTmp.length != 0) {
        audioSrc = audioTmp[0].src //retrive first img url
        console.log("Parsing audio url: " + src);
    } else {

    }

    //http://voler.ebook4rent.tw/book/img?p=1&f=jpg&r=150&preferWidth=950&preferHeight=1920&bookId=xxxx&token=xxx&bookToken=xxx
    if (src.indexOf("?p=1&") < 0) {
        flag = false;
        alert("找不到封面位址");
    }
    //flag = false;

    //url length enough, and pages more than one
    if (flag && src.length > 40 && pages > 1) {
        //for photo
        var links = [];
        //pages = 3; //for test
        for (i = 1; i <= pages; i++) {
            links.push(src1 + i + src2);
        }

        //photo index
        if (tempIndex === undefined || tempIndex < 0) {
            tempIndex = 0;
        }
        console.log("Send index:" + tempIndex);

        //for audio
        var audioLinks = [];
        if (audioSrc != undefined && audioSrc.length > 41) {
            var audioSrc1 = audioSrc.substring(0, 39); //head
            var audioSrc2 = audioSrc.substring(40); //tail
            //pages = 3; //for test
            for (i = 1; i <= pages; i++) {
                audioLinks.push(audioSrc1 + i + audioSrc2);
            }
        }

        //console.log(links);
        chrome.extension.sendRequest({
            links: links,
            dir: bookName,
            index: tempIndex,
            audios: audioLinks
        });
    }
}

var tempIndex;

if (typeof chrome.runtime.onMessage.myListenerAdded == "undefined") {
    chrome.runtime.onMessage.myListenerAdded = true; //avoid duplicate listener
    //chrome.runtime.onMessage.addListener(saveIndex);
    //chrome.runtime.onMessage.removeListener(saveIndex);
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action == "getDOM") {
            console.log("popup.js - request action");
            sendResponse(document.documentElement.outerHTML);
            console.log("popup.js - sendResponse");
        } else {
            sendResponse({}); // Send nothing..
            console.log("popup.js - else");
        }
    });
}

function saveIndex(request, sender, sendResponse) {
    console.log("Save index:");
    console.log(request);
    tempIndex = request.index;
}