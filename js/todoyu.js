var a = chrome.extension.getURL("css/todoyu.css");

$('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo("head");