var PLUGIN_INFO =
<KeySnailPlugin>
    <name>Greasemonkey</name>
    <description>Greasemonkey Util for KeySnail</description>
    <version>0.0.1</version>
    <updateURL>http://github.com/hogelog/keysnail-plugins/raw/master/greasemonkey.ks.js</updateURL>
    <author mail="konbu.komuro@gmail.com" homepage="http://hogel.org/">hogelog</author>
    <license>CC0</license>
    <minVersion>1.5.0</minVersion>
    <include>main</include>
    <provides>
        <ext>greasemonkey-execute-command</ext>
    </provides>
    <options>
    </options>
    <detail><![CDATA[]]></detail>
</KeySnailPlugin>;

ext.add("greasemonkey-execute-command", function () {
    var menuItems = GM_BrowserUI.getCommander(content).menuItems;
    if (menuItems.length == 0) {
        display.echoStatusBar("No Greasemonkey Menu Command");
        return false;
    }
    var commandList = [menuItems[i].getAttribute('label') for (i in menuItems)];
    prompt.selector({
        message: "Menu Command (Greasemonkey)",
        callback: function (index) {
            var item = menuItems[index];
            return item._commandFunc();
        },
        header: ["Command"],
        collection: commandList,
    });
    }, "Execute Greasemonkey Menu Command");
// vim: fenc=utf-8 sw=4 ts=4 et:
