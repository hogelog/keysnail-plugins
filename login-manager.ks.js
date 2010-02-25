var PLUGIN_INFO =
<KeySnailPlugin>
    <name>LoginManager</name>
    <description>LoginManager for KeySnail</description>
    <version>0.0.2</version>
    <updateURL>http://github.com/hogelog/keysnail-plugins/raw/master/loginmanager.ks.js</updateURL>
    <author mail="konbu.komuro@gmail.com" homepage="http://hogel.org/">hogelog</author>
    <license>CC0</license>
    <minVersion>1.5.0</minVersion>
    <include>main</include>
    <provides>
        <ext>login-manager-login</ext>
        <ext>login-manager-logout</ext>
    </provides>
    <options>
    </options>
    <detail><![CDATA[]]></detail>
</KeySnailPlugin>;

var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

var services = {
    pixiv: {
        HOST: ["http://www.pixiv.net"],
        LOGIN: "/index.php",
        LOGOUT: "/logout.php",
        usernameField: "pixiv_id",
        passwordField: "pass",
        extraField: {
            mode: "login",
            skip: "1",
        },
    },
    drawr: {
        HOST: ["http://drawr.net"],
        LOGIN: "/login.php",
        LOGOUT: "/logout.php",
        usernameField: "user_uid",
        passwordField: "user_upw",
        extraField: {
            mode: "autologin",
        },
    },
    mixi: {
        HOST: ["https://mixi.jp", "http://mixi.jp"],
        LOGIN: "/login.pl",
        LOGOUT: "/logout.pl",
        usernameField: "email",
        passwordField: "password",
        extraField: {
            next_url: "/home.pl",
        },
    },
    hatena: {
        HOST: ["https://www.hatena.ne.jp", "http://www.hatena.ne.jp"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "name",
        passwordField: "password",
        logoutBeforeLogin: true,
    },
    hatelabo: {
        HOST: ["https://www.hatelabo.jp", "http://www.hatelabo.jp"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "key",
        passwordField: "password",
        logoutBeforeLogin: true,
        extraField: {
            mode: "enter",
        },
    },
    tumblr: {
        HOST: ["http://www.tumblr.com"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "email",
        passwordField: "password",
    },
    twitter: {
        HOST: ["https://twitter.com", "http://twitter.com"],
        LOGIN: "/sessions",
        LOGOUT: "/sessions/destroy",
        usernameField: "session[username_or_email]",
        passwordField: "session[password]",
        extraField: {
            authenticity_token: tokenGetter(/authenticity_token.+value="(.+?)"/),
        },
    },
    "wassr.com": {
        HOST: ["https://wassr.com", "http://wassr.com", "https://wassr.jp", "http://wassr.jp"],
        LOGIN: "/account/login",
        LOGOUT: "/account/logout",
        usernameField: "login_id",
        passwordField: "login_pw",
        extraField: {
            CSRFPROTECT: tokenGetter(/CSRFPROTECT.+value="(.+?)"/),
        },
    },
    "wassr.jp": {
        HOST: ["https://wassr.jp", "http://wassr.jp", "https://wassr.com", "http://wassr.com"],
        LOGIN: "/account/login",
        LOGOUT: "/account/logout",
        usernameField: "login_id",
        passwordField: "login_pw",
        extraField: {
            CSRFPROTECT: tokenGetter(/CSRFPROTECT.+value="(.+?)"/),
        },
    },
};
for (name in services){
    services[name] = new Service(services[name]);
}

let userServices = plugins.options.userLoginServices;
if (userServices) {
    for (name in userServices){
        services[name] = new Service(userServices[name]);
    }
}

// Library
// {{{
function Service(service) //{{{
{
    let self = this;
    self.login = function(username){
        let content = {};
        let host = service.HOST[0];
        content[service.usernameField] = username;
        if (!self.setPassword(content, username)) {
            display.echoStatusBar('failed get password "'+host+'" as '+username);
            return false;
        }
        if (service.extraField && !self.setExtraField(content)) return false;

        let loginURL = host+service.LOGIN;
        let error = function(e) display.echoStatusBar('login failed "'+host+'" as '+username);
        let success = function(e) display.echoStatusBar('login "'+host+'" as '+username);
        let login = function() request(loginURL, content, success, error);
        if (service.logoutBeforeLogin) {
            let logoutURL = host+service.LOGOUT;
            return request(logoutURL, content, login, error);
        }

        login();
    };
    self.logout = function(){
        let content = {};
        let host = service.HOST[0];
        if (service.extraField && !self.setExtraField(content)) return false;
        let logoutURL = host+service.LOGOUT;
        let error = function() display.echoStatusBar('logout failed "'+host+'" as '+username);
        let success = function() display.echoStatusBar('logout "'+host+'" as '+username);
        request(logoutURL, content, success, error);
    };
    self.getLogins = function() {
        return [loginManager.findLogins({}, host, "", null) for each(host in service.HOST)]
        .reduce(function(sum, logins){
            return sum.concat(logins.filter(function(login)
                sum.length==0 || sum.filter(function(x)
                    x.username==login.username).length==0))
                }, []);
    };
    self.getUsernames = function(){
        return [x.username for each(x in self.getLogins()) if(x.username)];
    };
    self.setPassword = function(content, username){
        let logins = self.getLogins()
            .filter(function(x) x.username==username);

        if(logins.length==0) return false;
        content[service.passwordField] = logins[0].password;
        return content;
    };
    self.setExtraField = function(content){
        if (!service.extraField) return false;
        for (field in service.extraField){
            let value = service.extraField[field];
            switch(typeof value) {
            case "function":
                content[field] = value(service);
                break;
            case "string":
                content[field] = value;
                break;
            }
            if (!content[field]){
                display.echoStatusBar("failed get "+field);
                return false;
            }
        }
        return content;
    };
    for (prop in service){
        if (self[prop]) self["_"+prop] = self[prop];
        self[prop] = service[prop];
    }
} //}}}

function encode(content)
    [k+"="+encodeURIComponent(content[k]) for(k in content)].join("&");
function request(url, content, onload, onerror)
{
    let req = new XMLHttpRequest;
    req.open("POST", url, true);
    req.onload = onload;
    req.onerror = onerror;
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(encode(content));
}
function tokenGetter(pattern)
{
    return function(service){
        let res = util.httpGet(service.HOST[0]);
        if (pattern.test(res.responseText)){
            return RegExp.$1;
        }
    };
}
//}}}
let loginList = [[[s, u] for each (u in services[s].getUsernames())] for (s in services)].reduce(function (acc, login) acc.concat(login), []);
let logoutList = [[s] for (s in services)];

ext.add("login-manager-login", function (ev, arg) {
    prompt.selector({
        message: "Log In (LoginManager)",
        callback: function (index) {
            let [servicename, username] = loginList[index];
            let service = services[servicename];
            if (!service) {
                display.echoStatusBar(servicename + "service not found");
                return false;
            }
            service.login(username);
        },
        header: ["Service", "Username"],
        collection: loginList,
    });
    document.getElementById("keysnail-prompt-textbox").value = arg;
    }, "Log In (LoginManager)");
ext.add("login-manager-logout", function (arg) {
    prompt.selector({
        message: "Log Out (LoginManager)",
        callback: function (index) {
            let servicename = logoutList[index][0];
            let service = services[servicename];
            if (!service) {
                display.echoStatusBar(servicename + "service not found");
                return false;
            }
            service.logout();
        },
        header: ["Service"],
        collection: logoutList,
    });
    document.getElementById("keysnail-prompt-textbox").value = arg;
    }, "Log Out (LoginManager)");
// vim: fdm=marker fenc=utf-8 sw=4 ts=4 et:
