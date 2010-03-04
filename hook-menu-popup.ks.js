var PLUGIN_INFO =
<KeySnailPlugin>
    <name>HookMenuPopup</name>
    <description>add Hook Menu Popup Event</description>
    <version>0.0.2</version>
    <updateURL>http://github.com/hogelog/keysnail-plugins/raw/master/hook-menu-popup.ks.js</updateURL>
    <author mail="konbu.komuro@gmail.com" homepage="http://hogel.org/">hogelog</author>
    <license>CC0</license>
    <minVersion>1.5.0</minVersion>
    <include>main</include>
    <provides>
    </provides>
    <options>
    </options>
    <detail><![CDATA[
=== Usage ===

To paste code below to your .keysnail.js makes add hook menu popup event.

>||
function stopKeySnail (ev) {
    key.suspended = true;
}
function restartKeySnail (ev) {
    key.suspended = false;
}
hook.setHook('MenuPopupShowing', stopKeySnail);
hook.setHook('MenuPopupHiding', restartKeySnail);
||<

In this example, you can disable keysnail when showing popup menu.

==== Hook Points ====
HookMenuPopup hook points are as follows.
- MenuPopupShowing
- MenuPopupHiding
- MainMenuPopupShowing
- MainMenuPopupHiding
- ContextMenuPopupShowing
- ContextMenuPopupHiding

    ]]></detail>
    <detail lang="ja"><![CDATA[
=== 使い方 ===

以下のようなコードを.keysnail.jsに記述することでメニューポップアップイベントにフックを追加できます。

>||
function stopKeySnail (ev) {
    key.suspended = true;
}
function restartKeySnail (ev) {
    key.suspended = false;
}
hook.setHook('MenuPopupShowing', stopKeySnail);
hook.setHook('MenuPopupHiding', restartKeySnail);
||<

この例ではポップアップが表示されている間KeySnailを停止させます。

==== フックポイント ====
HookMenuPopupでは以下のフックポイントを提供します。
- MenuPopupShowing
- MenuPopupHiding
- MainMenuPopupShowing
- MainMenuPopupHiding
- ContextMenuPopupShowing
- ContextMenuPopupHiding

    ]]></detail>
</KeySnailPlugin>;

var listeners = plugins.hook_menu_popup ? plugins.hook_menu_popup.listeners : [];
plugins.hook_menu_popup = __ksSelf__;

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

function addListener(node, show, hide) {
    node.addEventListener("popupshowing", show, false);
    node.addEventListener("popuphiding", hide, false);
    listeners.push([node, show, hide]);
}
function removeListeners() {
    for (let i=0;i<listeners.length;++i) {
        let [node, show, hide] = listeners[i];
        node.removeEventListener("popupshowing", show, false);
        node.removeEventListener("popuphiding", hide, false);
    }
    listeners = [];
}

if (listeners.length > 0) {
    removeListeners();
}

var menus = document.getElementById("main-menubar").childNodes;
for (let i=0;i<menus.length;++i) {
    let popup = menus[i].firstChild;
    addListener(popup, callMainMenuPopupShowing, callMainMenuPopupHiding);
}
var contextMenu = document.getElementById("contentAreaContextMenu");
addListener(contextMenu, callContextMenuPopupShowing, callContextMenuPopupHiding);

hook.addToHook("Unload", removeListeners);

// vim: fenc=utf-8 sw=4 ts=4 et:
