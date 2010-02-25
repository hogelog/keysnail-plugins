// ========================== KeySnail Init File =========================== //

// この領域は, GUI により設定ファイルを生成した際にも引き継がれます
// 特殊キー, キーバインド定義, フック, ブラックリスト以外のコードは, この中に書くようにして下さい
// ========================================================================= //
//{{%PRESERVE%
// ここにコードを入力して下さい
for each (let id in ["keysnail-prompt-textbox", "urlbar"]) {
  let box = document.getElementById(id);
  let input = document.getAnonymousElementByAttribute(box, 'anonid', 'input');
  if (input)
      input.style.imeMode = "inactive";
}

plugins.options["hok.hint_keys"] = "hjklyuiopnm";
plugins.options["hok.actions"] = [
    ['x',
     M({ja: "要素のXPathをコピー", en: "copy XPath"}),
    function (elem)
    {
        function getElementXPath (elem) {
            if (elem.nodeType == 9) { // DOCUMENT_NODE = 9
                return "";
            }
            if (elem.hasAttribute("id")) {
                return 'id("'+elem.getAttribute("id")+'")';
            }
            let name = elem.tagName.toLowerCase();
            let parent = elem.parentNode;
            let path = arguments.callee(parent)+"/"+name;
            let children = Array.filter(parent.childNodes,
                function(e) e.nodeName == elem.nodeName && e.nodeType == elem.nodeType);
            if (children.length != 1 && children[0]!=elem) {
                path += "["+(children.indexOf(elem)+1)+"]";
            }
            return path;
        }
        command.setClipboardText(getElementXPath(elem));
    }],
];

ext.add("dialog-keysnail-plugin", function () openDialog("chrome://keysnail/content/pluginmanager.xul", "_blank", null));
ext.add("dialog-keysnail-preference", function () openDialog("chrome://keysnail/content/preference.xul", "_blank", null));
style.register("#keysnail-twitter-client-container{ display:none !important; }");
plugins.options["twitter_client.popup_new_statuses"]           = false;
plugins.options["twitter_client.automatically_begin"]          = false;
plugins.options["twitter_client.timeline_count_beginning"]     = 0;
plugins.options["twitter_client.timeline_count_every_updates"] = 0;

plugins.options["follow-link.targets"] = 'a[href], input:not([type="hidden"]), button';
plugins.options["follow-link.nextpattern"] = "^次へ|進む|^次.*|続|→|\\bnext|Next|≫";
plugins.options["follow-link.prevpattern"] = "\\bback|戻る|^前.*|←|\\bprev|Before|≪";

function findPattern(doc, pattern) {
    let target = plugins.options["follow-link.targets"];
    let regex = RegExp(pattern);
    let result = doc.querySelectorAll(target);
    for (let i=result.length-1;i>=0;--i) {
        let elem = result[i];
        if (regex.test(elem.textContent) || regex.test(elem.value)) {
            return elem;
        }
    }
    return false;
}
function findRel(doc, rel) {
    for each(let query in ['a[rel~="%s"]', 'link[rel~="%s"]']) {
      let link = doc.querySelector(util.format(query, rel));
      if (link)
        return link;
    }
    return false;
}
function followLink(doc, rel, pattern) {
    let link = findRel(doc, rel) || findPattern(doc, pattern);
    if (link);
        plugins.hok.followLink(link, plugins.hok.CURRENT_TAB)
}

ext.add("follow-next-link", function () followLink(content.document, "next", plugins.options["follow-link.nextpattern"]), "follow next link");
ext.add("follow-prev-link", function () followLink(content.document, "prev", plugins.options["follow-link.prevpattern"]), "follow previous link");

function digitURI(num) {
    function tostr(num, len) {
        let str = String(num);
        while(str.length<len) {
            str = "0" + str;
        }
        return str;
    }
    let pattern = /^(.*\D|)(\d+)(\D*)$/;
    let url = content.location.href;
    let digit = url.match(pattern);
    if (digit) {
        let numstr = tostr(num + parseInt(digit[2], 10), digit[2].length);
        content.location.href = digit[1] + numstr + digit[3];
        return true;
    }
    return false;
}

ext.add("digit-url-incement", function () digitURI(1), "increment last digit in URL");
ext.add("digit-url-decement", function () digitURI(-1), "decrement last digit in URL");


ext.add("login-manager-login", function () false, "login with loginManager");
ext.add("login-manager-logout", function () false, "logout with loginManager");
//}}%PRESERVE%
// ========================================================================= //

// ========================= Special key settings ========================== //

key.quitKey              = "ESC";
key.helpKey              = "undefined";
key.escapeKey            = "<f7>";
key.macroStartKey        = "undefined";
key.macroEndKey          = "undefined";
key.universalArgumentKey = "undefined";
key.negativeArgument1Key = "undefined";
key.negativeArgument2Key = "undefined";
key.negativeArgument3Key = "undefined";
key.suspendKey           = "`";

// ================================= Hooks ================================= //


hook.setHook('KeyBoardQuit', function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_ESCAPE, true);
    var elem = document.commandDispatcher.focusedElement;
    if (elem) {
        elem.blur();
    }
    command.closeFindBar();
    if (!document.getElementById("keysnail-prompt").hidden)
      prompt.finish(true);
    gBrowser.focus();
    content.focus();
});



// ============================== Black list =============================== //

hook.addToHook("LocationChange", function (aNsURI) {
    var URL = aNsURI ? aNsURI.spec : null;
    key.suspendWhenMatched(URL, key.blackList);
});

key.blackList = [
    'http://fastladder.com/'
];

// ============================= Key bindings ============================== //

key.setViewKey(['g', 'o'], function (ev, arg) {
    ext.exec("quickmark-open-page", arg, ev);
}, 'Open Page (QuickMark)', true);

key.setViewKey([['g', 'T'], ['h'], ['C-p']], function () {
    getBrowser().mTabContainer.advanceSelectedTab(-1, true);
}, 'ひとつ左のタブへ');

key.setViewKey([['g', 't'], ['l'], ['C-n']], function () {
    getBrowser().mTabContainer.advanceSelectedTab(1, true);
}, 'ひとつ右のタブへ');

key.setViewKey(['g', 'g'], function () {
    goDoCommand("cmd_scrollTop");
}, 'ページ先頭へ移動', true);

key.setViewKey(['g', 'u'], function () {
    var uri = getBrowser().currentURI;
    if (uri.path == "/") {
        return;
    }
    var pathList = uri.path.split("/");
    if (!pathList.pop()) {
        pathList.pop();
    }
    loadURI(uri.prePath + pathList.join("/") + ("/"));
}, '一つ上のディレクトリへ移動');

key.setViewKey(['g', 'U'], function () {
    var uri = window._content.location.href;
    if (uri == null) {
        return;
    }
    var root = uri.match(/^[a-z]+:\/\/[^/]+\//);
    if (root) {
        loadURI(root, null, null);
    }
}, 'ルートディレクトリへ移動');

key.setViewKey(['g', 'i'], function () {
    command.focusElement(command.elementsRetrieverTextarea, 0);
}, '最初のインプットエリアへフォーカス', true);

key.setViewKey(['g', 'j'], function (ev, arg) {
    ext.exec("quickmark-jump-page", arg, ev);
}, 'Jump Page (QuickMark)', true);

key.setViewKey([['.'], ['d']], function (ev) {
    BrowserCloseTabOrWindow();
}, 'タブ / ウィンドウを閉じる');

key.setViewKey('e', function () {
    command.interpreter();
}, 'コマンドインタプリタ');

key.setViewKey('y', function () {
    command.setClipboardText(content.location.href);
}, 'copy URL', true);

key.setViewKey('j', function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_DOWN, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_DOWN, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_DOWN, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_DOWN, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_DOWN, true);
}, '5行スクロールダウン');

key.setViewKey('k', function (ev) {
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_UP, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_UP, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_UP, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_UP, true);
    key.generateKey(ev.originalTarget, KeyEvent.DOM_VK_UP, true);
}, '5行スクロールアップ');

key.setViewKey('K', function () {
    goDoCommand("cmd_scrollPageUp");
}, '一画面分スクロールアップ');

key.setViewKey('J', function () {
    goDoCommand("cmd_scrollPageDown");
}, '一画面スクロールダウン');

key.setViewKey('G', function () {
    goDoCommand("cmd_scrollBottom");
}, 'ページ末尾へ移動', true);

key.setViewKey('+', function (ev, arg) {
    shell.input(null, arg);
}, 'コマンドの実行', true);

key.setViewKey('r', function () {
    BrowserReload();
}, '更新', true);

key.setViewKey('R', function () {
    BrowserReloadSkipCache();
}, '更新(キャッシュを無視)');

key.setViewKey('H', function () {
    BrowserBack();
}, '戻る');

key.setViewKey('L', function () {
    BrowserForward();
}, '進む');

key.setViewKey('f', function (ev, arg) {
    ext.exec("hok-start-foreground-mode", arg);
}, 'Start foreground hint mode', true);

key.setViewKey('F', function (ev, arg) {
    ext.exec("hok-start-background-mode", arg);
}, 'Start background hint mode', true);

key.setViewKey(';', function (ev, arg) {
    ext.exec("hok-start-extended-mode", arg);
}, 'Start extended hint mode', true);

key.setViewKey('u', function (ev) {
    undoCloseTab();
}, '閉じたタブを元に戻す');

key.setViewKey('o', function () {
    command.focusToById("urlbar");
}, 'ロケーションバーへフォーカス', true);

key.setViewKey('t', function (ev) {
    BrowserOpenTab();
    var b = getBrowser();
    b.mTabContainer.selectedIndex = b.mTabs.length - 1;
    command.focusToById("urlbar");
}, 'タブを開く');

key.setViewKey(['z', 'i'], function (ev, arg) {
    ext.exec("text-zoom-enlarge", arg, ev);
}, 'テキストサイズを大きく', true);

key.setViewKey(['z', 'o'], function (ev, arg) {
    ext.exec("text-zoom-reduce", arg, ev);
}, 'テキストサイズを小さく', true);

key.setViewKey('U', function (ev, arg) {
    ext.exec("hok-start-background-mode", arg, ev);
}, 'HoK - リンクをバックグラウンドで開く', true);

key.setViewKey('Y', function (ev, arg) {
    ext.exec("hok-start-foreground-mode", arg, ev);
}, 'HoK - リンクをフォアグラウンドで開く', true);

key.setViewKey('$', function (ev, arg) {
    var b = getBrowser();
    b.mTabContainer.selectedIndex = b.mTabs.length - 1;
}, 'select last tab');

key.setViewKey('^', function (ev, arg) {
    getBrowser().mTabContainer.selectedIndex = 0;
}, 'select first tab');

key.setViewKey(':', function (ev, arg) {
    ext.select(arg, ev);
}, 'エクステ一覧表示', true);

key.setViewKey([',', 't', 't'], function (ev, arg) {
    ext.exec("twitter-client-tweet", arg, ev);
}, 'つぶやく', true);

key.setViewKey([',', 't', 'l'], function (ev, arg) {
    ext.exec("twitter-client-display-timeline", arg, ev);
}, 'TL を表示', true);

key.setViewKey([',', 't', 'r'], function (ev, arg) {
    ext.exec("twitter-client-show-mentions", arg, ev);
}, '@ 一覧表示 (自分への言及一覧)', true);

key.setViewKey([',', 'r', 'r'], function () {
    userscript.reload();
}, '設定ファイルを再読み込み');

key.setViewKey('<left>', function () {
    var browser = getBrowser();
    if (browser.mCurrentTab.previousSibling) {
        browser.moveTabTo(browser.mCurrentTab, browser.mCurrentTab._tPos - 1);
    } else {
        browser.moveTabTo(browser.mCurrentTab, browser.mTabContainer.childNodes.length - 1);
    }
}, '選択中のタブを左へ');

key.setViewKey('<right>', function () {
    var browser = getBrowser();
    if (browser.mCurrentTab.nextSibling) {
        browser.moveTabTo(browser.mCurrentTab, browser.mCurrentTab._tPos + 1);
    } else {
        browser.moveTabTo(browser.mCurrentTab, 0);
    }
}, '選択中のタブを右へ');

key.setViewKey([']', ']'], function (ev, arg) {
    ext.exec("follow-next-link", arg, ev);
}, 'follow next link', true);

key.setViewKey([']', 'k'], function (ev, arg) {
    ext.exec("digit-url-incement", arg, ev);
}, 'increment last digit in URL', true);

key.setViewKey(['[', '['], function (ev, arg) {
    ext.exec("follow-prev-link", arg, ev);
}, 'follow previous link', true);

key.setViewKey(['[', 'k'], function (ev, arg) {
    ext.exec("digit-url-decement", arg, ev);
}, 'decrement last digit in URL', true);

key.setViewKey('P', function (ev, arg) {
    plugins.hok.openURI(command.getClipboardText(), plugins.hok.NEW_BACKGROUND_TAB);
}, 'open clipboard url in newtab');

key.setViewKey('p', function (ev, arg) {
    plugins.hok.openURI(command.getClipboardText(), plugins.hok.CURRENT_TAB);
}, 'open clipboard url in currenttab');

key.setViewKey('M', function (ev, arg) {
    ext.exec("quickmark-mark-page", arg, ev);
}, 'Mark Page (QuickMark)', true);

key.setViewKey([',', 'd', 'p'], function (ev, arg) {
    ext.exec('dialog-keysnail-preference', arg, ev);
}, true);

key.setViewKey([',', 'R', 'R'], function () {
    var appStartup = Cc['@mozilla.org/toolkit/app-startup;1'].getService(Ci.nsIAppStartup);
    appStartup.quit(appStartup.eRestart | appStartup.eAttemptQuit);
}, 'Firefox を再起動');
