if (typeof chrome.runtime.onMessage.myListenerAdded == "undefined") {
    chrome.runtime.onMessage.myListenerAdded = true; //avoid duplicate listener
    //chrome.runtime.onMessage.addListener(saveIndex);
    //chrome.runtime.onMessage.removeListener(saveIndex);
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action == "getDOM") {
            console.log("popup.js - request action");
            sendResponse(document.documentElement.outerHTML);//send html to popup.js
            console.log("popup.js - sendResponse");
        } else {
            sendResponse({}); // Send nothing..
            console.log("popup.js - else");
        }
    });
}