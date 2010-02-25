var PLUGIN_INFO =
<KeySnailPlugin>
    <name>QuickMark</name>
    <description>QuickMark for KeySnail</description>
    <version>0.0.1</version>
    <updateURL>http://github.com/hogelog/keysnail-plugins/raw/master/quickmark.ks.js</updateURL>
    <author mail="konbu.komuro@gmail.com" homepage="http://hogel.org/">hogelog</author>
    <license>CC0</license>
    <minVersion>1.5.0</minVersion>
    <include>main</include>
    <provides>
        <ext>quickmark-mark-page</ext>
        <ext>quickmark-jump-page</ext>
        <ext>quickmark-open-page</ext>
        <ext>quickmark-delete-page</ext>
    </provides>
    <options>
    </options>
    <detail><![CDATA[]]></detail>
</KeySnailPlugin>;

const PersistName = "quickmark";
let marks = persist.restore(PersistName) || {};

function jumpURI(uri, bg) {
    gBrowser.loadOneTab(uri, null, null, null, true);
}
function openURI(uri) {
    gBrowser.loadURIWithFlags(uri, null, null, null, null);
}
ext.add("quickmark-mark-page", function () {
    prompt.reader({
        message: "Mark Page (QuickMark)",
        callback: function (arg) {
            let [mark, uri] = arg.split(/\s+/);
            if (!uri) {
              uri = content.location.href;
              }
            marks[arg] = uri;
            persist.preserve(marks, PersistName);
        },
    });
    }, "Mark Page (QuickMark)");
ext.add("quickmark-jump-page", function () {
    prompt.reader({
        message: "Jump Page (QuickMark)",
        onChange: function (arg) {
            let mark = arg.textbox.value;
            let uri = marks[mark];
            if (uri) {
                jumpURI(uri);
                arg.finish();
            }
        },
    });
    }, "Jump Page (QuickMark)");
ext.add("quickmark-open-page", function () {
    prompt.reader({
        message: "Open Page (QuickMark)",
        onChange: function (arg) {
            let mark = arg.textbox.value;
            let uri = marks[mark];
            if (uri) {
                arg.finish();
                openURI(uri);
            }
        },
    });
    }, "Open Page (QuickMark)");
ext.add("quickmark-delete-page", function () {
    let uri = content.location.href;
    for (mark in marks) {
        if (marks[mark] == uri) {
            delete marks[mark];
        }
    }
    persist.preserve(marks, PersistName);
    }, "Delete Page (QuickMark)");
// vim: fenc=utf-8 sw=4 ts=4 et:
