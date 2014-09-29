var a = chrome.extension.getURL("css/todoyu.css");

$('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo("head");

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