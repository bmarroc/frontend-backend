var functions = require('firebase-functions');
var admin = require('firebase-admin');

var serviceAccountKey = require('./service-account-key.json');
var adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccountKey);
admin.initializeApp(adminConfig);

var db = admin.database();

var firebase = require("firebase");
var config = {
    apiKey: ,
    databaseURL: ,
    storageBucket: ,
    authDomain: ,
    messagingSenderId: ,
    projectId: 
  };
firebase.initializeApp(config);

var app = require('express')();
app.engine('handlebars', require('express-handlebars')({
    defaultLayout: '_base',
    helpers: {
        section: function(name, options) {
            if (!this._sections){
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        },
        ifequal: function(arg1, arg2, options) {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        }
    }
}));
app.set('view engine', 'handlebars');
app.use(require('cookie-parser')());

app.get("/zoom", (request, response) => {
    var data = request.query.data;
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else { 
        if (request.cookies.__session) {
            var session = JSON.parse(request.cookies.__session);
            if (session.authId && session.user && session.id && session.messagingToken) {
                var authId = session.authId;
                var user = session.user;
                var id = session.id;
                var messagingToken = session.messagingToken;
                Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
                    if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                        if (data.startsWith("http://") || data.startsWith("https://")) {
                            response.render("zoom", {
                                layout: null,
                                data: null, 
                                url: data
                            });
                        } else {
                            response.render("zoom", {
                                layout: null,
                                data: data,
                                url: null
                            });
                        }
                    } else {
                        response.render("error"); 
                    }
                }).catch((error) => {
                    console.log(error);
                    response.render("error");
                });
            } else {
                response.render("error");
            }
        } else {
            response.redirect("/login"); 
        } 
    }
});

app.post("/logout.json/android", (request, response) => {
    var authId = request.body.authId || "";
    var user = request.body.user || "";
    var id = request.body.id || "";
    var messagingToken = request.body.messagingToken || "";
    if (authId === '' || user === '' || id === '' || messagingToken === '') {
        response.json({ 
            error: 'ERROR: Ha ocurrido un error. Intente nuevamente.'
        });
    } else {
        Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
            if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                return db.ref("Users/byAuthId/"+authId).orderByValue().equalTo(messagingToken).limitToFirst(1).once("value").then((snapshot) => {
                    var keys = [];
                    snapshot.forEach((data) => {
                        keys.push(data.key);
                    });
                    return Promise.all([db.ref("Users/byAuthId/"+authId+"/"+keys[0]).remove(), db.ref("Users/byMessagingToken/"+messagingToken).remove()]);
                }).then(() => {
                    response.json({ 
                        logout: 'Ha cerrado sesión exitosamente.'
                    });
                });
            } else {
                response.json({ 
                    error: 'ERROR: Ha ocurrido un error. Intente nuevamente.'
                });
            }
        }).catch((error) => {
            console.log(error);
            response.json({ 
                error: 'ERROR: Ha ocurrido un error. Intente nuevamente.'
            });
        });   
    }
});

app.post("/apply.json/android", (request, response) => {
    var user = request.body.user || "";
    var id = request.body.id || "";
    var password = request.body.password || "";
    var messagingToken = request.body.messagingToken || "";
    
    if (user === '' || id === '' || password === '') {
        response.json({ 
            error: 'ERROR: Complete todos los datos.' 
        });
    } else {
        if (messagingToken === '') {
            response.json({ 
                error: 'ERROR: Ha ocurrido un error. Intente nuevamente.' 
            });
        } else {
            Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value")]).then((snapshots) => {
                if (snapshots[0].exists()) {
                    response.json({ 
                        error: 'ERROR: Ese usuario ya existe.' 
                    });
                    return null;
                } else {
                    if (snapshots[1].exists()) {
                        response.json({ 
                            error: 'ERROR: Ese id ya existe.' 
                        });
                        return null;
                    } else {
                        db.ref("Accounts/byAuthId").push({
                            user: user,
                            id: id,
                            password: password
                        }).then((ref)=> {
                            var authId = ref.key;
                            return Promise.all([db.ref("Accounts/byUser/"+user).set(authId), db.ref("Accounts/byId/"+id).set(authId), db.ref("Users/byMessagingToken/"+messagingToken).set(authId), db.ref("Users/byAuthId/"+authId).push(messagingToken)]).then(() => {
                                return admin.auth().createCustomToken(authId);
                            }).then((authToken) => { 
                                response.json({ 
                                    authToken: authToken,
                                    user: user,
                                    id: id,
                                    messagingToken: messagingToken  
                                });
                                return null;
                            });
                        })
                    }
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }    
});

app.post("/login.json/android", (request, response) => {
    var user = request.body.user || "";
    var password = request.body.password || "";
    var messagingToken = request.body.messagingToken || "";
    if (user === '' || password === '') {
        response.json({ 
            error: 'ERROR: Complete todos los datos.' 
        });
    } else {
        if (messagingToken === '') {
            response.json({ 
                error: 'ERROR: Ha ocurrido un error. Intente nuevamente.' 
            });
        } else {
            db.ref("Accounts/byUser/"+user).once("value").then((snapshot) => {
                if (snapshot.exists()) {
                    var authId = snapshot.val();
                    return db.ref("Accounts/byAuthId/"+authId+"/password").once("value").then((snapshot) => {
                        if (snapshot.val() === password) {
                            return Promise.all([db.ref("Users/byMessagingToken/"+messagingToken).set(authId), db.ref("Users/byAuthId/"+authId).push(messagingToken)]).then(() => {
                                return Promise.all([admin.auth().createCustomToken(authId), db.ref("Accounts/byAuthId/"+authId+"/id").once("value")]);
                            }).then((snapshots) => {
                                var authToken = snapshots[0];
                                var id = snapshots[1].val();
                                response.json({
                                    authToken: authToken,
                                    user: user,
                                    id: id,
                                    messagingToken: messagingToken
                                });
                                return null;
                            });
                        } else {
                            response.json({ 
                                error: "ERROR: El password es incorrecto." 
                            });
                            return null;
                        }
                    })
                } else {
                    response.json({ 
                        error: 'ERROR: El usuario no existe.' 
                    });
                    return null; 
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }    
});

app.get("/logout", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else { 
        if (request.cookies.__session) {
            var session = JSON.parse(request.cookies.__session);
            if (session.authId && session.user && session.id && session.messagingToken) {
                var authId = session.authId;
                var user = session.user;
                var id = session.id;
                var messagingToken = session.messagingToken;
                Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
                    if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                        return db.ref("Users/byAuthId/"+authId).orderByValue().equalTo(messagingToken).limitToFirst(1).once("value").then((snapshot) => {
                            var keys = [];
                            snapshot.forEach((data) => {
                                keys.push(data.key);
                            });
                            return db.ref("Users/byAuthId/"+authId+"/"+keys[0]).remove();
                        }).then(() => {
                            return db.ref("Users/byMessagingToken/"+messagingToken).remove();
                        }).then(() => {
                            response.clearCookie("__session");
                            response.render("logout"); 
                            return null;
                        });
                    } else {
                        response.render("error"); 
                        return null;
                    }
                }).catch((error) => {
                    console.log(error);
                    response.render("error");
                });
            } else {
                response.render("error");
            }
        } else {
            response.redirect("/login");
        } 
    }
});

app.get("/chat", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else { 
        if (request.cookies.__session) {
            var session = JSON.parse(request.cookies.__session);
            if (session.authId && session.user && session.id && session.messagingToken) {
                var authId = session.authId;
                var user = session.user;
                var id = session.id;
                var messagingToken = session.messagingToken;
                Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
                    if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                        response.render("chat");
                    } else {
                        response.render("error"); 
                    }
                }).catch((error) => {
                    console.log(error);
                    response.render("error");
                });
            } else {
                response.render("error");
            }
        } else {
            response.redirect("/login"); 
        } 
    }
});

app.post("/apply", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else { 
        var user = request.body.user;
        var password = request.body.password;
        var id = request.body.id;
        var authId = JSON.parse(request.cookies.__session).authId;
        var messagingToken = JSON.parse(request.cookies.__session).messagingToken;
        if (user === '' ||  id === '' || password === '') {
            response.clearCookie("__session");
            response.render("error"); 
        } else {
            Promise.all([db.ref("Accounts/byAuthId/"+authId+"/user").once("value"), db.ref("Accounts/byAuthId/"+authId+"/password").once("value"), db.ref("Accounts/byAuthId/"+authId+"/id").once("value")]).then((snapshots) => {
                if (snapshots[0].exists() && snapshots[1].exists() && snapshots[2].exists()) {
                    if (snapshots[0].val() === user && snapshots[1].val() === password && snapshots[2].val() === id) {
                        return Promise.all([db.ref("Users/byMessagingToken/"+messagingToken).set(authId), db.ref("Users/byAuthId/"+authId).push(messagingToken)]).then(() => {
                            response.cookie("__session", JSON.stringify({
                                authId: authId, 
                                user: user, 
                                id: id,
                                messagingToken: messagingToken
                            }), {
                                maxAge: 31536000000
                            }); 
                            response.redirect("/chat");
                            return null;
                        })
                    } else {
                        response.clearCookie("__session");
                        response.render("error"); 
                        return null;
                    }
                } else {
                    response.clearCookie("__session");
                    response.render("error"); 
                    return null;
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }
});

app.post("/apply.json", (request, response) => {
    var user = request.body.user || "";
    var id = request.body.id || "";
    var password = request.body.password || "";
    
    if (user === '' || id === '' || password === '') {
        response.json({ 
            error: 'ERROR: Complete todos los datos.' 
        });
    } else {
        Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value")]).then((snapshots) => {
            if (snapshots[0].exists()) {
                response.json({ 
                    error: 'ERROR: Ese usuario ya existe.' 
                });
                return null;
            } else {
                if (snapshots[1].exists()) {
                    response.json({ 
                        error: 'ERROR: Ese id ya existe.' 
                    });
                    return null;
                } else {
                    db.ref("Accounts/byAuthId").push({
                        user: user,
                        id: id,
                        password: password
                    }).then((ref)=> {
                        var authId = ref.key;
                        return Promise.all([db.ref("Accounts/byUser/"+user).set(authId), db.ref("Accounts/byId/"+id).set(authId)]).then(() => {
                                    return admin.auth().createCustomToken(authId);
                                });
                    }).then((authToken) => { 
                        response.json({ 
                            authToken: authToken 
                        });
                        return null;
                    });
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    }    
});

app.get("/apply", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else { 
        if (request.cookies.__session) {
            var session = JSON.parse(request.cookies.__session);
            if (session.authId && session.user && session.id && session.messagingToken) {
                var authId = session.authId;
                var user = session.user;
                var id = session.id;
                var messagingToken = session.messagingToken;
                Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
                    if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                        response.redirect("/chat");
                    } else {
                        response.render("error"); 
                    }
                }).catch((error) => {
                    console.log(error);
                    response.render("error");
                });
            } else {
                response.render("error");
            }
        } else {
            response.render("apply"); 
        } 
    }
});

app.post("/login", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else { 
        var user = request.body.user;
        var password = request.body.password;
        var authId = JSON.parse(request.cookies.__session).authId;
        var messagingToken = JSON.parse(request.cookies.__session).messagingToken;
        if (user === '' || password === '') {
            response.clearCookie("__session");
            response.render("error"); 
        } else {
            Promise.all([db.ref("Accounts/byAuthId/"+authId+"/user").once("value"), db.ref("Accounts/byAuthId/"+authId+"/password").once("value"), db.ref("Accounts/byAuthId/"+authId+"/id").once("value")]).then((snapshots) => {
                if (snapshots[0].exists() && snapshots[1].exists() && snapshots[2].exists()) {
                    if (snapshots[0].val() === user && snapshots[1].val() === password) {
                        var id = snapshots[2].val();
                        return Promise.all([db.ref("Users/byMessagingToken/"+messagingToken).set(authId), db.ref("Users/byAuthId/"+authId).push(messagingToken)]).then(() => {
                            response.cookie("__session", JSON.stringify({
                                authId: authId, 
                                user: user, 
                                id: id,
                                messagingToken: messagingToken
                            }), {
                                maxAge: 31536000000
                            }); 
                            response.redirect("/chat");
                            return null;
                        })
                    } else {
                        response.clearCookie("__session");
                        response.render("error"); 
                        return null;
                    }
                } else {
                    response.clearCookie("__session");
                    response.render("error"); 
                    return null;
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }
});

app.post("/login.json", (request, response) => {
    var user = request.body.user || "";
    var password = request.body.password || "";
    if (user === '' || password === '') {
        response.json({ 
            error: 'ERROR: Complete todos los datos.' 
        });
    } else {
        db.ref("Accounts/byUser/"+user).once("value").then((snapshot) => {
            if (snapshot.exists()) {
                var authId = snapshot.val();
                return db.ref("Accounts/byAuthId/"+authId+"/password").once("value").then((snapshot) => {
                    if (snapshot.val() === password) {
                        return admin.auth().createCustomToken(authId).then((authToken) => {
                            response.json({ 
                                authToken: authToken 
                            });
                            return null;
                        });
                    } else {
                        response.json({ 
                            error: "ERROR: El password es incorrecto." 
                        });
                        return null;
                    }
                })
            } else {
                response.json({ 
                    error: 'ERROR: El usuario no existe.' 
                });
                return null; 
            }
        }).catch((error) => {
            console.log(error);
        });
    }    
});

app.get("/login", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else {
        if (request.cookies.__session) {
            var session = JSON.parse(request.cookies.__session);
            if (session.authId && session.user && session.id && session.messagingToken) {
                var authId = session.authId;
                var user = session.user;
                var id = session.id;
                var messagingToken = session.messagingToken;
                Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
                    if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                        response.redirect("/chat");
                    } else {
                        response.render("error"); 
                    }
                }).catch((error) => {
                    console.log(error);
                    response.render("error");
                });
            } else {
                response.render("error");
            }
        } else {
            response.render("login"); 
        } 
    }
});

app.get("/", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else {
        if (request.cookies.__session) {
            var session = JSON.parse(request.cookies.__session);
            if (session.authId && session.user && session.id && session.messagingToken) {
                var authId = session.authId;
                var user = session.user;
                var id = session.id;
                var messagingToken = session.messagingToken;
                Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
                    if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                        response.redirect("/chat");
                    } else {
                        response.render("error"); 
                    }
                }).catch((error) => {
                    console.log(error);
                    response.render("error"); 
                });
            } else {
                response.render("error"); 
            }
        } else {
            response.redirect("/login");
        } 
    }
});

app.get("/**", (request, response) => {
    var ua = request.headers['user-agent'].toLowerCase();
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
        response.render("mobile");
    } else {
        if (request.cookies.__session) {
            var session = JSON.parse(request.cookies.__session);
            if (session.authId && session.user && session.id && session.messagingToken) {
                var authId = session.authId;
                var user = session.user;
                var id = session.id;
                var messagingToken = session.messagingToken;
                Promise.all([db.ref("Accounts/byUser/"+user).once("value"), db.ref("Accounts/byId/"+id).once("value"), db.ref("Users/byMessagingToken/"+messagingToken).once("value")]).then((snapshots) => {
                    if (snapshots[0].val() === authId && snapshots[1].val() === authId && snapshots[2].val() === authId ) {
                        response.redirect("/chat");
                    } else {
                        response.render("error"); 
                    }
                }).catch((error) => {
                    console.log(error);
                    response.render("error");
                });
            } else {
                response.render("error");
            }
        } else {
            response.redirect("/login"); 
        }    
    }
});

exports.web = functions.https.onRequest(app);

exports.sendNotifications = functions.database.ref("Messages/{_from}/{_to}/{messageKey}").onCreate((snapshot, context) => {
    console.log("sendNotifications");
    console.log(context.params._from);
    console.log(context.params._to);
    console.log(context.params.messageKey);
    console.log(snapshot.val());

    var _from = context.params._from;
    var _to = context.params._to;
    var messageKey = context.params.messageKey;
    var message = snapshot.val();

    return db.ref("Accounts/byId/"+_from).once("value").then((snapshot) => {
        var authId_from = snapshot.val();
        return db.ref("Users/byAuthId/"+authId_from).once("value");
    }).then((snapshot) => {
        var payload = {
            data: {
                _from: _from,
                _to: _to,
                messageKey: messageKey,
                message: message,
                sended: "✓", 
                received: ""
            }
        };
        var registrationToken = [];
        snapshot.forEach((data) => {
            var token = data.val();
            registrationToken.push(token);
            console.log(token);
        });
        return admin.messaging().sendToDevice(registrationToken, payload); 
    }).then(() => {
        return db.ref("Accounts/byId/"+_to).once("value");
    }).then((snapshot) => {
        var authId_to = snapshot.val();
        return db.ref("Users/byAuthId/"+authId_to).once("value");
    }).then((snapshot) => {
        if (snapshot.exists()) {
            var payload = {
                data: {
                    _from: _from,
                    _to: _to,
                    messageKey: messageKey,
                    message: message,
                    sended: "", 
                    received: ""
                }
            };
            var registrationToken = [];
            snapshot.forEach((data) => {
                var token = data.val();
                registrationToken.push(token);
                console.log(token);
            });
            return admin.messaging().sendToDevice(registrationToken, payload);
        } else {
            console.log("El usuario no tiene ninguna sesion abierta");
            return null;
        }
    }).then(() => {
        console.log("Se ha enviado al push service para su entrega al cliente, pero no se sabe si le llego al cliente o no (podria no tener internet)");
        return null;
    }).catch((error) => {
        console.log(error);
    });
});

exports.deleteMessages = functions.database.ref("Messages/{_from}/{_to}/{messageKey}").onDelete((snapshot, context) => {
    console.log("deleteMessages");

    var _from = context.params._from;
    var _to = context.params._to;
    var messageKey = context.params.messageKey;
    var message = snapshot.val();

    return db.ref("Accounts/byId/"+_from).once("value").then((snapshot) => {
        var authId_from = snapshot.val();
        return db.ref("Users/byAuthId/"+authId_from).once("value");
    }).then((snapshot) => {
        var payload = {
            data: {
                _from: _from,
                _to: _to,
                messageKey: messageKey,
                message: message,
                sended: "✓", 
                received: "✓"
            }
        };
        var registrationToken = [];
        snapshot.forEach((data) => {
            var token = data.val();
            registrationToken.push(token);
            console.log(token);
        });
        return admin.messaging().sendToDevice(registrationToken, payload);
    }).catch((error) => {
        console.log(error);
    });

});

exports.loginUsers = functions.database.ref("Users/byAuthId/{authId}/{key}").onCreate((snapshot, context) => {
    console.log("loginUsers");
    console.log("authId: "+context.params.authId);
    console.log("key: "+context.params.key);
    console.log("messagingToken: "+snapshot.val());

    var sendMessage = function(payload, i) {
        var registrationToken = snapshot.val();
        console.log(registrationToken);
        if (i === payload.length) {
            return null;
        }
        return admin.messaging().sendToDevice(registrationToken, payload[i]).then(() => {
            console.log("sendMessage");
            return sendMessage(payload, i+1);
        });
    }

    var id = "";
    return db.ref("Accounts/byAuthId/"+context.params.authId+"/id").once("value").then((snapshot) => {
        id = snapshot.val();
        console.log("id: "+id);
        return db.ref("Messages").orderByChild(id).once("value");
    }).then((snapshot) => {
        var snapshotJSON = snapshot.toJSON(); 
        console.log("snapshotJSON: "+snapshotJSON);
        var payload = [];
        for (var _from in snapshotJSON) {
            for (var _to in snapshotJSON[_from]) {
                for (var messageKey in snapshotJSON[_from][_to]) {
                    if (_to === id) {
                        payload.push({
                            data: {
                                _from: _from,
                                _to: _to,
                                messageKey: messageKey,
                                message: snapshotJSON[_from][_to][messageKey],
                                sended: "", 
                                received: ""
                            }
                        })
                    }
                }
            }
        }
        console.log("payload: "+payload);
        return sendMessage(payload, 0);
    });
});
