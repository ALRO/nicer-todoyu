"use strict";

var nicerTodoyu = {};

/**
 * Initialize all custom stuff
 */
nicerTodoyu.init = function() {
    nicerTodoyu.loadPreviousStates();
    nicerTodoyu.loadAssets();
    nicerTodoyu.clickableTaskNumbers();
    nicerTodoyu.hidableLeftBar();

    // $('#panelwidget-filterpresetlist-list-task').chosen();
};


/**
 *  Appends css files to header
 */
nicerTodoyu.loadAssets = function() {
    $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("css/todoyu.css") + '" >').appendTo("head");
};


/**
 *  Makes task numbers select on click for easy copying
 */
nicerTodoyu.clickableTaskNumbers = function() {
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

/**
 * Enables the hiding of the left bar
 */
nicerTodoyu.hidableLeftBar = function() {
    var $panel = $('#panel'),
        $toggler = $('<div class="panel-toggle">' +
            '<i class="icon-plus"/>' +
            '<i class="icon-minus"/>' +
            '</div>');

    $panel.before($toggler);

    $toggler.on('click', function() {
        var $body = $('body');
        if ($body.is('.panelOff')) {
            $body.removeClass('panelOff');
            chrome.storage.local.set({
                'panelOff': false
            })
        } else {
            $body.addClass('panelOff')
            chrome.storage.local.set({
                'panelOff': true
            })
        }
    });
};


/**
 * Load some settings from the local storage
 */
nicerTodoyu.loadPreviousStates = function() {
    chrome.storage.local.get(function(storage) {
        if (storage['panelOff']) {
            $('body').toggleClass('panelOff');
        }
    });
    setTimeout(function() {
        $('body').addClass('afterLoading');
    }, 50);
};






nicerTodoyu.init();