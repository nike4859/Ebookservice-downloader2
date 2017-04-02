//display message
function renderStatus(statusText) {
    document.getElementById('status').textContent = statusText;
}

var links, index, dir, id;
var url, rootUrl;
var bookDocument; //ebook body
var downloadErrorFlag = true; //download error stop
var mode; //pdf,music,epub

document.addEventListener('DOMContentLoaded', function() {
    //execute content script
    chrome.tabs.executeScript(null, {
        file: "content_script.js"
    });

    //register listener
    document.getElementById('pdf-button').addEventListener('click', function() {
        downloadPDF();
        resetButton();
    });
    document.getElementById('music-button').addEventListener('click', function() {
        downloadMusic();
        resetButton();
    });
    document.getElementById('epub-button').addEventListener('click', function() {
        downloadePub();
        resetButton();
    });
});

//rest button disabled
function resetButton() {
    document.getElementById('pdf-button').disabled = !document.getElementById('pdf-button').disabled;
    document.getElementById('music-button').disabled = !document.getElementById('music-button').disabled;
    document.getElementById('epub-button').disabled = !document.getElementById('epub-button').disabled;
    //console.log(document.getElementById('loading-icon').style.visibility);
    document.getElementById('loading-icon').style.visibility = (document.getElementById('loading-icon').style.visibility === 'visible' ? 'hidden' : 'visible');
}

//query ebook html body
// chrome.extension.onRequest.addListener(function(response) {
//     bookDocument = response.doc;
//     console.log(bookDocument);
//     console.log(bookDocument.toString());
// });

//query ebook html body
//http://stackoverflow.com/questions/4532236/how-to-access-the-webpage-dom-rather-than-the-extension-page-dom
//http://stackoverflow.com/questions/19758028/chrome-extension-get-dom-content
chrome.tabs.query({
    active: true,
    currentWindow: true
}, function(tabs) {
    //console.log(tabs[0]);
    url = tabs[0].url; //get url
    rootUrl = url.toString().replace(/^(.*\/\/[^\/?#]*).*$/, "$1"); //get root url
    chrome.tabs.sendMessage(tabs[0].id, {
        action: "getDOM"
    }, function(response) {
        //console.log(response);
        //var doc = document.implementation.createHTMLDocument("example");
        //doc.documentElement.innerHTML = response;
        parser = new DOMParser();
        doc = parser.parseFromString(response, "text/html");
        bookDocument = doc;
    });
});

function downloadPDF() {
    console.log('download pdf');
    mode = 'pdf';

    var bookName, pages;
    var src, src1, src2;
    var flag = true;

    var arrayName = bookDocument.querySelectorAll("div.top_bookname"); //page combobox
    //console.log(arrayName);
    if (arrayName.length != 0) {
        bookName = arrayName["0"].innerText;
        console.log(bookName);
    } else {
        flag = false;
        alert("找不到書本");
    }

    var arrayOpts = bookDocument.querySelectorAll("option"); //page combobox
    //console.log(arrayOpts.length);
    if (arrayOpts.length != 0) {
        pages = (arrayOpts.length - 1) * 2; //calculate  amount of pages
        console.log("Page length:" + pages);
    } else {
        flag = false;
        alert("找不到書碼");
    }

    // var arrayLis = bookDocument.querySelectorAll("li img"); //page
    // console.log(arrayLis);
    // console.log(arrayLis[0].attributes['src'].nodeValue);

    //http://voler.ebook4rent.tw/book/img?p=1&f=jpg&r=150&preferWidth=950&preferHeight=1920&bookId=xxxx&token=xxx&bookToken=xxx
    var arrayLis = bookDocument.querySelectorAll("li img"); //page
    //console.log(arrayLis);
    if (arrayLis.length != 0) {
        coverFlag = false;
        for (var i = 0; i < arrayLis.length; i++) {
            tmpSrc = rootUrl + arrayLis[i].attributes['src'].nodeValue
            if (tmpSrc.indexOf("?p=1&") > 0) {
                src = tmpSrc;
                coverFlag = true;
                console.log("Parsing url: " + src);
                break;
            }
        }
        if (!coverFlag) {
            flag = false;
            alert("找不到封面位址");
        }
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

    //flag = false;
    //url length enough, and pages more than one
    if (flag && src.length > 40 && pages > 1) {
        //for photo
        links = [];
        //pages = 3; //for test
        for (i = 1; i <= pages; i++) {
            links.push(src1 + i + src2);
        }

        //photo index
        // if (tempIndex === undefined || tempIndex < 0) {
        //     tempIndex = 0;
        // }
        // console.log("Send index:"+tempIndex);
        downloadErrorFlag = true; //download error stop
        dir = sanitize(bookName, '');
        index = 0;
        downloadLinks(links, dir, index, mode);
    }
}

function downloadMusic() {
    console.log('download music');
    mode = 'music';

    var bookName, pages;
    var audioSrc, audioSrc1, audioDrc2;
    var flag = true;

    var arrayName = bookDocument.querySelectorAll("div.top_bookname"); //page combobox
    //console.log(arrayName);
    if (arrayName.length != 0) {
        bookName = arrayName["0"].innerText;
        console.log(bookName);
    } else {
        flag = false;
        alert("找不到書本");
    }

    var arrayOpts = bookDocument.querySelectorAll("option"); //page combobox
    //console.log(arrayOpts.length);
    if (arrayOpts.length != 0) {
        pages = (arrayOpts.length - 1) * 2; //calculate  amount of pages
        console.log("Page length:" + pages);
    } else {
        flag = false;
        alert("找不到書碼");
    }

    //0-39 40-
    //http://voler.ebook4rent.tw/book/audio?p=5&code=3&bookId=xxx&token=xxx&bookToken=xxx
    //var audioTmp = bookDocument.querySelectorAll("div"); //mp3
    var audioTmp = bookDocument.querySelectorAll("div audio"); //mp3
    //console.log(audioTmp);
    if (audioTmp.length != 0) {
        audioSrc = rootUrl + audioTmp[0].attributes['src'].value; //retrive first img url
        console.log("Parsing audio url: " + audioSrc);
    } else {
        flag = false;
        alert("找不到音檔");
    }

    //chack music of url
    if (flag) {
        //for audio
        var audioLinks = [];
        if (audioSrc != undefined && audioSrc.length > 41) {
            audioSrc1 = audioSrc.substring(0, 40); //head
            audioSrc2 = audioSrc.substring(41); //tail
            if (audioSrc1.charAt(audioSrc1.length - 1) != "=" || audioSrc2.charAt(0) != "&") {
                flag = false;
                console.log("audio src1:" + audioSrc1);
                console.log("audio src2:" + audioSrc2);
                alert("音檔不正確");
            }
        }
    }

    //flag = false;
    //url length enough, and pages more than one
    if (flag && audioSrc.length > 41 && pages > 1) {
        //for photo
        links = [];
        //pages = 3; //for test
        for (i = 1; i <= pages; i++) {
            links.push(audioSrc1 + i + audioSrc2);
        }
        //photo index
        // if (tempIndex === undefined || tempIndex < 0) {
        //     tempIndex = 0;
        // }
        // console.log("Send index:"+tempIndex);
        downloadErrorFlag = false; //download error stop
        dir = sanitize(bookName, '');
        index = 0;
        downloadLinks(links, dir, index, mode);
    }
}

function downloadePub() {
    console.log('download ePub');
    mode = 'epub';
}

//download event
chrome.downloads.onChanged.addListener(function(delta) {
    //moniter download
    //console.log("ebookservice listener");
    //console.log(delta.state);
    if (!delta.state) {
        return;
    }
    if (downloadErrorFlag) { //download error stop
        if (delta.state.current != 'complete') { //complete, interrupted
            return;
        }
    }
    if (id != delta.id) {
        return;
    }
    //download complete
    if (index < links.length) {
        downloadLinks(links, dir, index, mode);
    } else {
        resetButton();
        renderStatus('下載完成');
        //window.close();
    }
});

// chrome.extension.onRequest.addListener(function(response) {
//     renderStatus('下載中，請勿離開此頁面');
//     dir = response.dir;
//     dir = sanitize(dir, '');
//     //dir = dir.replace(/\\/, "-");
//     links = response.links;
//     index = response.index;

//     if (index > 0) {
//         if (index < links.length) {
//             var r = confirm("是否接續下載?(" + (index + 1) + "/" + links.length + ")");
//             if (r != true) {
//                 index = 0;
//             }
//         } else {
//             var r = confirm("重新下載?");
//             if (r != true) {
//                 window.close();
//                 return;
//             }
//             index = 0;
//         }
//     }

//     downloadLinks(links, dir, index);
// });

// Download all visible checked links.
function downloadLinks(link, dir, indexLocal, modeAction) {
    var pageNum = padLeft((indexLocal + 1), 3);
    renderStatus('下載中，請勿離開此頁面(' + pageNum + '/' + link.length + ')');
    var file
    if (modeAction == 'pdf') {
        file = "./" + dir + "/img" + pageNum + ".jpg";
    } else if (modeAction == 'music') {
         file = "./" + dir + "/MP3/" + pageNum + ".mp3";
         console.log(link[indexLocal]);
    }
    index = index + 1;
    //need reload permissions
    chrome.downloads.download({
            url: link[indexLocal],
            filename: file
        },
        function(downloadId) {
            //send index to content script
            if (downloadId === undefined) {
                console.log(chrome.runtime.lastError);
                console.log(file);
                renderStatus('下載發生錯誤');
            } else {
                console.log(downloadId + " Ok");
                id = downloadId;
                //send to content script
                // chrome.tabs.query({
                //     active: true,
                //     currentWindow: true
                // }, function(tabs) {
                //     chrome.tabs.sendMessage(tabs[0].id, {
                //         index: index
                //     });
                // });
            }
        });
    //window.close();
}

/* 左邊補0 */
function padLeft(str, len) {
    str = '' + str;
    return str.length >= len ? str : new Array(len - str.length + 1).join("0") + str;
}

//取代不合法符號
var illegalRe = /[\/\?<>\\:\*\|":]/g;
var controlRe = /[\x00-\x1f\x80-\x9f]/g;
var reservedRe = /^\.+$/;
var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
var windowsTrailingRe = /[\. ]+$/;

function sanitize(input, replacement) {
    var sanitized = input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement)
        .replace(windowsTrailingRe, replacement);
    return sanitized;
}