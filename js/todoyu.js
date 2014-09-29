"use strict";

var nicerTodoyu = {};

/**
 * Initialize all custom stuff
 */
nicerTodoyu.init = function(){
    nicerTodoyu.loadCss();
    nicerTodoyu.clickableTaskNumbers();
};


/**
 *  Appends css files to header
 */
nicerTodoyu.loadCss = function(){
    var todoyuCssUrl = chrome.extension.getURL("css/todoyu.css");
    $('<link rel="stylesheet" type="text/css" href="' + todoyuCssUrl + '" >').appendTo("head");
};


/**
 *  Makes task numbers select on click for easy copying
 */
nicerTodoyu.clickableTaskNumbers = function(){
    $('body').on('click', '.taskNumber', function(e) {
        var text = e.currentTarget;
        var range, selection;

        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
};
