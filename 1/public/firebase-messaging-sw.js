importScripts('/__/firebase/4.12.1/firebase.js');
importScripts('/__/firebase/init.js');
importScripts('/scripts/idb.js');
importScripts('/content-provider.js');

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
    
    console.log('[firebase-messaging-sw.js] Received Firebase Background Message');
    var data = payload.data;

    var contentProvider = new ContentProvider("innerdatabase.db");
    contentProvider.addDB().then(() => {
        return contentProvider.getSession();
    }).then((session) => {
        var myId = session.id;
        var db = contentProvider.db;
        var messageKey = data.messageKey;
        if (data._from === myId) {
            var store = data._to;
            var myUser = session.user;
            var message = data.message;
            var sended = data.sended;
            var received = data.received;
            self.clients.matchAll({includeUncontrolled: true}).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        "firebase-messaging-msg-data": {
                            "data": data
                        },
                        "firebase-messaging-msg-type": "push-msg-received-background"
                    });
                });
            });
            return contentProvider.updateMessage(myId, store, messageKey, myUser, message, sended, received);
        } else {
            var date = new Date();
            var day = date.getDate();
            if (day<10) {
                day = "0".concat(day.toString());
            }
            var month = date.getMonth()+1;
            if (month<10) {
                month = "0".concat(month.toString());
            }
            var year = date.getFullYear();
            if (year<10) {
                year = "0".concat(year.toString());
            }
            var hours = date.getHours();
            if (hours<10) {
                hours = "0".concat(hours.toString());
            }
            var minutes = date.getMinutes();
            if (minutes<10) {
                minutes = "0".concat(minutes.toString());
            }
            var seconds = date.getSeconds();
            if (seconds<10) {
                seconds = "0".concat(seconds.toString());
            }

            var time = {
                day: day,
                month: month,
                year: year,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            }

            var store = data._from;
            var user = "";
            var message = data.message;
            firebase.database().ref('Messages/'+store+'/'+myId+'/'+messageKey).remove();

            self.clients.matchAll({includeUncontrolled: true}).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        "firebase-messaging-msg-data": {
                            "data": data
                        },
                        "firebase-messaging-msg-type": "push-msg-received-background"
                    });
                });
            });

            return contentProvider.getUser(myId, store).then((value) => {
                user = value;
                var mKey = firebase.database().ref().push().key;
                return contentProvider.addMessage(myId, store, mKey, user, message, time);
            }).then(() => {
                contentProvider.db.close();
                var notificationTitle = '¡NUEVO MENSAJE!';
                var notificationOptions = {
                    body: `${user} te ha escrito`,
                    icon: '/img/ic_launcher.png',
                    requireInteraction: true, 
                    tag: user
                };
                return self.registration.showNotification(notificationTitle, notificationOptions);
            });
        }
    }).catch((error) => {
        console.log(error);
    });
});

self.addEventListener('message', (event) => {
    var message= event.data;
    console.log(message);
});










