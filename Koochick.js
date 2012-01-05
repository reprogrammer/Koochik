// Koochick
// Copyright (c) 2012, Mohsen Vakilian
// Released under the GPLv3 license
// http://www.gnu.org/copyleft/gpl.html
// Koochick is based on GmailTinyUrl, which is written by Mark Wilkie and released under GPL at http://bitterpill.org/gmail_tinyurl/.
// --------------------------------------------------------------------
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://www.greasespot.net/
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Koochik
// @namespace     https://github.com/reprogrammer/Koochik
// @description   Select a URL in gmail compose area, and convert it to a tinyurl with the key command (macos - CTL/Shift/T) (win/linux - Alt/Shift/U)
// @include       http://mail.google.com/*
// @include       https://mail.google.com/*
// ==/UserScript==
GM_log('Loaded Gmail TinyUrl...');

var is_ctrlkey = false;
var is_shiftkey = false;

window.addEventListener('keydown', keyHandler, false);
window.addEventListener('keyup', keyUpHandler, false);

function keyUpHandler(event) {
    if (event.ctrlKey) {
        is_ctrlkey = false;
    } else if (event.shiftKey) {
        is_shiftkey = false;
    }
    //return false;
}

function keyHandler(event) {
    GM_log(event.ctrlKey + ' ' + event.shiftKey + ' ' + event.keyCode);
    if (navigator.appVersion.indexOf("Mac") < 0) {
        if (event.altKey == true && event.shiftKey == true && event.keyCode == 85) {
            GM_log('get tiny url');
            ginyUrl();
        }
    } else {
        if (event.ctrlKey == true && event.shiftKey == true && event.keyCode == 84) {
            GM_log('get tiny url');
            ginyUrl();
        }
    }
}


function ginyUrl() {
    var url = null;
    //var ta_compose = document.getElementsById('ta_compose');
    var ta_compose = document.getElementsByName('body')[0];
    GM_log("ta_compose is:" + ta_compose);
    if (ta_compose) {
        url = getUrlFromTextarea(ta_compose);
    } else {
        var sel = window.getSelection();
        url = sel.toString();
        GM_log("window.getSelection().toString() is:" + url);
    }
    if (!url || url == '' || !url.match(/(http|https):\/\/\w/)) {
        alert("The text you have selected (" + url + ") does not seem to be a valid URL.");
    } else {
        getTinyUrl(url);
    }
}

function getUrlFromTextarea(ta_compose) {
    var start = ta_compose.selectionStart;
    var end = ta_compose.selectionEnd;
    var url = null;
    if (start < end) {
        url = ta_compose.value.substring(start, end);
    }
    return url;
}

function replaceUrlInTextarea(ta_compose, url) {
    var start = ta_compose.selectionStart;
    var end = ta_compose.selectionEnd;
    var text = ta_compose.value;
    var start_text = text.substring(0, start);
    var end_text = text.substring(end, text.length);
    ta_compose.value = start_text + url + end_text;
}


function getTinyUrl(url) {
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://tinyurl.com/api-create.php?url=" + url,
        headers: {
            "User-Agent": "monkeyagent",
            "Accept": "text/monkey,text/xml,text/plain",
        },
        onload: function (details) {
            if (details.status != 200) {
                alert('Sorry, we were unable to fetch your tinyurl at this time: ' + details.statusText);
            } else {
                //var ta_compose = document.getElementById('ta_compose');
                var ta_compose = document.getElementsByName('body')[0];
                if (ta_compose) {
                    replaceUrlInTextarea(ta_compose, details.responseText.replace(/\s+|\r|\n/g, ''));
                } else {
                    var sel = window.getSelection();
                    sel.deleteFromDocument();
                    sel.getRangeAt(0).insertNode(document.createTextNode(details.responseText.replace(/\s+|\r|\n/g, '')));
                }
            }
        }
    });
}
