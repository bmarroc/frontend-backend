class ContentProvider {
    constructor(db_name) {
        this.db_name = db_name;
        this.db = null;
    }

    addDB() {
        return new Promise((resolve, reject) => {
            var openRequest = indexedDB.open(this.db_name, 1);
            openRequest.addEventListener("success", (event) => {
                this.db = event.target.result;
                console.log("opening database version "+this.db.version+"...");
                resolve(this.db);
            });
            openRequest.addEventListener("error", (event) => {
                var message = event.target.error.message;
                var begin = message.lastIndexOf("(");
                var end = message.lastIndexOf(")");
                var version = "";
                for (var i = begin+1; i<end; i++){
                    version = version + message.charAt(i);
                }
                var db_version = parseInt(version);
                var anotherOpenRequest = indexedDB.open(this.db_name, db_version);
                anotherOpenRequest.addEventListener("success", (event) => {
                    this.db = event.target.result;
                    console.log("opening database version "+this.db.version+"...");
                    resolve(this.db);
                });
            });
        });
    }
   
    addStore(sessionId, store) {
        return new Promise((resolve, reject) => {
            var version = this.db.version;
            this.db.close();
            if (store === "__session") {
                var openRequest = indexedDB.open(this.db_name, version+1);
                openRequest.addEventListener("upgradeneeded", (event) => {
                    var upgradeDb = event.target.result;
                    if (!upgradeDb.objectStoreNames.contains("__session")) {
                        var storeRequest = upgradeDb.createObjectStore(store, {
                            autoIncrement: true
                        });
                        console.log("creating store...");
                    }
                    var transaction = event.target.transaction;
                    transaction.addEventListener("complete", (event) => {
                        this.db = upgradeDb;
                        console.log("getting store...");
                        resolve(this.db);
                    });
                });  
            } else {
                if (store === "contacts") {
                    var openRequest = indexedDB.open(this.db_name, version+1);
                    openRequest.addEventListener("upgradeneeded", (event) => {
                        var upgradeDb = event.target.result;
                        if (!upgradeDb.objectStoreNames.contains(sessionId+"/contacts")) {
                            var storeRequest = upgradeDb.createObjectStore(sessionId+"/contacts", {
                                keyPath: "id"
                            });
                            storeRequest.createIndex("user", "user", {
                                unique: true
                            });
                            console.log("creating store...");
                        }
                        var transaction = event.target.transaction;
                        transaction.addEventListener("complete", (event) => {
                            this.db = upgradeDb;
                            console.log("getting store...");
                            resolve(this.db);
                        });
                    })
                } else {
                    var openRequest = indexedDB.open(this.db_name, version+1);
                    openRequest.addEventListener("upgradeneeded", (event) => {
                        var upgradeDb = event.target.result;
                        if (!upgradeDb.objectStoreNames.contains(sessionId+"/"+store)) {
                            var storeRequest = upgradeDb.createObjectStore(sessionId+"/"+store, {
                                keyPath: "messageKey"
                            });
                            storeRequest.createIndex("time", "time", {
                                unique: true
                            });
                            console.log("creating store...");
                        }
                        var transaction = event.target.transaction;
                        transaction.addEventListener("complete", (event) => {
                            this.db = upgradeDb;
                            console.log("getting store...");
                            resolve(this.db);
                        });
                    })
                }
            }
        });
    }

    getSession() {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction("__session", 'readonly');
            var st = tx.objectStore("__session");
            var request = st.get(0);
            request.addEventListener("success", (event) => {
                console.log("getting session...");
                resolve(event.target.result);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        });
    }

    addSession(session) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction("__session", 'readwrite');
            var st = tx.objectStore("__session");
            var request = st.put(session, 0);
            request.addEventListener("success", (event) => {
                console.log("adding session...");
                resolve(event.target.result);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        });
    }

    deleteSession() {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction('__session', 'readwrite');
            var st = tx.objectStore('__session');
            var request = st.delete(0);
            request.addEventListener("success", (event) => {
                console.log("deleting session...");
                resolve(event.target.result);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        });
    }

    addMessage(sessionId, store, messageKey, user, message, time) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction(sessionId+"/"+store, 'readwrite');
            var st = tx.objectStore(sessionId+"/"+store);
            var request = st.add({ 
                messageKey: messageKey,
                user: user, 
                message: message, 
                time: time,
                sended: "", 
                received: ""
            });
            request.addEventListener("success", (event) => {
                console.log("adding message...");
                resolve(request);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        });
    } 

    updateMessage(sessionId, store, messageKey, user, message, sended, received) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction(sessionId+"/"+store, 'readonly');
            var st = tx.objectStore(sessionId+"/"+store);
            var request = st.get(messageKey);
            request.addEventListener("success", (event) => {
                if (event.target.result) {
                    var time = event.target.result.time;
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

                }
                console.log("getting message...");
                resolve(time);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        }).then((time) => {
            return new Promise((resolve, reject) => {
                var tx = this.db.transaction(sessionId+"/"+store, 'readwrite');
                var st = tx.objectStore(sessionId+"/"+store);
                var request = st.put({ 
                    messageKey: messageKey,
                    user: user, 
                    message: message, 
                    time: time, 
                    sended: sended, 
                    received: received
                });
                request.addEventListener("success", (event) => {
                    console.log("updating message...");
                    resolve(request);
                });
                request.addEventListener("error", (event) => {
                    reject(event);
                });
            });
        })
    }

    clearStore(sessionId, store) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction(sessionId+"/"+store, 'readwrite');
            var st = tx.objectStore(sessionId+"/"+store);
            var request = st.clear(); 
            request.addEventListener("success", (event) => {
                console.log("clearing store...");
                resolve(request);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        });
    }

    addContact(user, sessionId, id) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction(sessionId+'/contacts', 'readwrite');
            var st = tx.objectStore(sessionId+'/contacts');
            var request = st.add({
                id: id, 
                user: user 
            });
            request.addEventListener("success", (event) => {
                console.log("adding contact...");
                resolve(request);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        })
    }

    deleteContact(sessionId, id) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction(sessionId+'/contacts', 'readwrite');
            var st = tx.objectStore(sessionId+'/contacts');
            var request = st.delete(id);
            request.addEventListener("success", (event) => {
                console.log("deleting contact...");
                resolve(request);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        });
    }

    deleteStore(sessionId, store) {
        return new Promise((resolve, reject) => {
            var version = this.db.version;
            this.db.close();
            var openRequest = indexedDB.open(this.db_name, version+1);
            openRequest.addEventListener("upgradeneeded", (event) => {
                var upgradeDb = event.target.result;
                upgradeDb.deleteObjectStore(sessionId+"/"+store);
                var transaction = event.target.transaction;
                transaction.addEventListener("complete", (event) => {
                    this.db = upgradeDb;
                    console.log("deleting store...");
                    resolve(this.db);
                });
            })
        });
    }

    getUser(sessionId, id) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction(sessionId+"/contacts", 'readonly');
            var st = tx.objectStore(sessionId+"/contacts");
            var request = st.get(id);
            request.addEventListener("success", (event) => {
                console.log("getting user...");
                var user = event.target.result.user;
                resolve(user);
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        });
    }

    getCursor(sessionId, store) {
        return new Promise((resolve, reject) => {
            var tx = this.db.transaction(sessionId+"/"+store, 'readonly');
            var st = tx.objectStore(sessionId+"/"+store);
            var request = st.openCursor();
            var messages = [];
            request.addEventListener("success", (event) => {
                var cursor = event.target.result;
                if (!cursor) {
                    resolve(messages);
                } else {
                    messages.push(cursor.value);
                    cursor.continue();
                }
            });
            request.addEventListener("error", (event) => {
                reject(event);
            });
        })
    }
}