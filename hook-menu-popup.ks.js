var PLUGIN_INFO =
<KeySnailPlugin>
    <name>HookMenuPopup</name>
    <description>add Hook Menu Popup Event</description>
    <version>0.0.1</version>
    <updateURL>http://github.com/hogelog/keysnail-plugins/raw/master/hook-menu-popup.ks.js</updateURL>
    <author mail="konbu.komuro@gmail.com" homepage="http://hogel.org/">hogelog</author>
    <license>CC0</license>
    <minVersion>1.5.0</minVersion>
    <include>main</include>
    <provides>
    </provides>
    <options>
    </options>
    <detail><![CDATA[]]></detail>
</KeySnailPlugin>;

function callMainMenuPopupShowing (ev) {
    hook.callHook("MainMenuPopupShowing", ev);
    hook.callHook("MenuPopupShowing", ev);
}
function callMainMenuPopupHiding (ev) {
    hook.callHook("MainMenuPopupHiding", ev);
    hook.callHook("MenuPopupHiding", ev);
}
function callContextMenuPopupShowing (ev) {
    hook.callHook("ContextPopupShowing", ev);
    hook.callHook("MenuPopupShowing", ev);
}
function callContextMenuPopupHiding (ev) {
    hook.callHook("ContextMenuPopupHiding", ev);
    hook.callHook("MenuPopupHiding", ev);
}

var menus = document.getElementById("main-menubar").childNodes;
for (let i=0;i<menus.length;++i) {
    let popup = menus[i].firstChild;
    popup.addEventListener("popupshowing", callMainMenuPopupShowing, false);
    popup.addEventListener("popuphiding", callMainMenuPopupHiding, false);
}
var contextMenu = document.getElementById("contentAreaContextMenu");
contextMenu.addEventListener("popupshowing", callContextMenuPopupShowing, false);
contextMenu.addEventListener("popuphiding", callContextMenuPopupHiding, false);

// vim: fenc=utf-8 sw=4 ts=4 et:
