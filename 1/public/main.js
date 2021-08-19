'use strict';

class ChatApp {
    constructor(window, contentProvider, session) {
        this.contentProvider = contentProvider;
        this.session = session;

        this.serviceWorker = navigator.serviceWorker;

    
        this.window = window;

        this.body = this.window.document.body;
    
        this.checkSetup();

        this.database = firebase.database();

        this.addContactButton = document.getElementById('addContactButton');
        this.addContactMenu = document.getElementById('addContactMenu');

        this.deleteMessagesButton = document.getElementById('deleteMessagesButton');
        this.deleteMessagesMenu = document.getElementById('deleteMessagesMenu');

        this.contactsMenu = document.getElementById('contactsMenu');
        this.chatContent = document.getElementById('chatContent');
        this.currentChat = document.getElementById('currentChat');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');



        this.newContactDialog = document.getElementById('newContactDialog');
        this.newContactDialog.addEventListener('MDCDialog:accept', () => {
           var userInput = document.getElementById("newContactDialog_userInput");
           var idInput = document.getElementById("newContactDialog_idInput");
           if (userInput.value !== "" && idInput.value !== "") {
               this.addContacts(userInput.value, idInput.value);
           }
           userInput.value = "";
           idInput.value = "";
        })
        this.newContactDialog.addEventListener('MDCDialog:cancel', () => {
           var userInput = document.getElementById("newContactDialog_userInput");
           var idInput = document.getElementById("newContactDialog_idInput");
           userInput.value = "";
           idInput.value = "";
        })
        this.addContactButton.addEventListener('click', () => {
            this.addContactMenu.MDCMenu.open = !this.addContactMenu.MDCMenu.open;
        });
        this.addContactMenu.MDCMenu.quickOpen = true;
        this.addContactMenu.addEventListener('MDCMenu:selected', (evt) => {
            this.newContactDialog.MDCDialog.lastFocusedTarget = event.target;
            this.newContactDialog.MDCDialog.show();
        });
        
        
        this.deleteMessagesButton.addEventListener('click', () => {
            deleteMessagesMenu.MDCMenu.open = !deleteMessagesMenu.MDCMenu.open;
        });
        this.deleteMessagesMenu.MDCMenu.quickOpen = true;
        this.deleteMessagesMenu.addEventListener('MDCMenu:selected', (evt) => {
            var user = this.currentChat.getAttribute("data-user");
            var id = this.currentChat.getAttribute("data-id");
            this.contentProvider.clearStore(this.session.id, id).then(() => {
                this.updateUI(user, id);
            }).catch((error) =>{
                console.log(error);
            });
        });

        this.copiedSnackbar = document.getElementById('copiedSnackbar');

        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        this.messageInput.addEventListener('keyup', (event) => {
            event.preventDefault();
            if (event.key === "Enter") {
                this.sendButton.click();
            }
        });
        this.messageInput.addEventListener('contextmenu', (event) => {  
            event.preventDefault();
            window.app.copiedSnackbar.MDCSnackbar.show({
                message: 'Pegar',
                actionText: 'OK',
                actionHandler: function() {
                    navigator.clipboard.readText().then((text) => {
                        window.app.messageInput.focus();
                        window.app.messageInput.value = text;
                    }).catch((error) => {
                        console.log(error);
                    }); 
                }
            });                                                                  
        });

        this.logoutButton = document.getElementById('logoutButton');
        this.logoutAnchor = document.getElementById('logoutAnchor');
        this.exitDialog = document.getElementById('exitDialog');
        this.exitDialog.addEventListener('MDCDialog:accept', () => {
            console.log('closing session...');
            this.logoutAnchor.click();
        });
        this.logoutButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.exitDialog.MDCDialog.lastFocusedTarget = event.target;
            this.exitDialog.MDCDialog.show();
        });

        this.receiveMessage();

        this.updateReceiver();
    };
    checkSetup() {
        if (!this.window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
            this.window.alert('You have not configured and imported the Firebase SDK.');
        }
    };
    sendMessage() {
        if (this.messageInput.value !== "") {
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
            var messageKey = this.database.ref().push().key;
            var message = this.messageInput.value.split("\n")[0];

            var mdc_list_item = document.createElement('li');
            mdc_list_item.setAttribute("class", "mdc-list-item");
            mdc_list_item.setAttribute("id", messageKey);
            mdc_list_item.setAttribute("style", "height: unset; padding: 16px 16px;");
            mdc_list_item.innerHTML =   '<span class="mdc-list-item__text" style="white-space: initial; word-wrap: break-word;">'+ 
                                            '<b>'+this.session.user+'</b></br><div id="'+messageKey+'/text">'+message+'</div>'+
                                            '<span class="mdc-list-item__secondary-text" style="left: 12px;">['+time.day+'/'+time.month+'/'+time.year+' '+time.hours+':'+time.minutes+':'+time.seconds+']</span>'+
                                        '</span>'+
                                        '<span class="mdc-list-item__meta" style="position:absolute; bottom: 12px; right: 12px;"></span>';
            this.chatContent.appendChild(mdc_list_item);

            var script = document.createElement("script");        
            script.innerHTML = "(function() {"+
                                    "var message = document.getElementById('"+messageKey+"');"+
                                    "var messageText = document.getElementById('"+messageKey+"/text');"+                                    
                                    "message.addEventListener('click', (event) => {"+    
                                        "console.log('Clicked!');"+ 
                                        "window.open('/zoom?data="+encodeURIComponent(message)+"','','top=100, left=100, width=500, height=400');"+                                                               
                                    "});"+
                                    "message.addEventListener('contextmenu', (event) => {"+ 
                                        "event.preventDefault();"+
                                        "navigator.clipboard.writeText(messageText.textContent).then(() => {"+
                                            "console.log('Copied!');"+ 
                                            "window.app.copiedSnackbar.MDCSnackbar.show({"+
                                                "message: 'Copiado'"+
                                            "});"+
                                        "}).catch((error) => {"+
                                            "console.log(error);"+ 
                                        "})"+                                                                                                                         
                                    "});"+                                    
                                "})();"
            this.chatContent.appendChild(script);

            var separator = document.createElement('li');
            separator.setAttribute("role", "separator");
            separator.setAttribute("class", "mdc-list-divider");
            this.chatContent.appendChild(separator);
                       
            this.chatContent.scrollTop = this.chatContent.scrollHeight;
            this.messageInput.value = "";
            
            this.contentProvider.addMessage(this.session.id, this.currentChat.getAttribute("data-id"), messageKey, this.session.user, message, time).then(() => {
                return this.database.ref('Messages/'+this.session.id+'/'+this.currentChat.getAttribute("data-id")+'/'+messageKey);
            }).then((ref) => {
                return ref.set(message);
            }).catch((error) => {
                console.log(error);
            });
        }
    };
    updateUI(user, id) {
        console.log("updateUI");
        if (user !== "" && id !== "") {
            this.currentChat.textContent = user;
            this.currentChat.setAttribute("data-id", id);
            this.currentChat.setAttribute("data-user", user);
            this.contentProvider.getCursor(this.session.id, id).then((messages) => {
                this.chatContent.innerHTML = "";
                for (var i=0; i<messages.length; i++) {
                    var val = messages[i];

                    var mdc_list_item = document.createElement('li');
                    mdc_list_item.setAttribute("class", "mdc-list-item");
                    mdc_list_item.setAttribute("id", val.messageKey);
                    mdc_list_item.setAttribute("style", "height: unset; padding: 16px 16px;");
                    mdc_list_item.innerHTML =   '<span class="mdc-list-item__text" style="white-space: initial; word-wrap: break-word;">'+ 
                                                    '<b>'+val.user+'</b></br><div id="'+val.messageKey+'/text">'+val.message+'</div>'+
                                                    '<span class="mdc-list-item__secondary-text" style="left: 12px;">['+val.time.day+'/'+val.time.month+'/'+val.time.year+' '+val.time.hours+':'+val.time.minutes+':'+val.time.seconds+']</span>'+
                                                '</span>'+
                                                '<span class="mdc-list-item__meta" style="position:absolute; bottom: 12px; right: 12px;">'+val.sended+val.received+'</span>';
                    this.chatContent.appendChild(mdc_list_item);

                    var script = document.createElement("script");                
                    script.innerHTML = "(function() {"+
                                            "var message = document.getElementById('"+val.messageKey+"');"+
                                            "var messageText = document.getElementById('"+val.messageKey+"/text');"+                                    
                                            "message.addEventListener('click', (event) => {"+    
                                                "console.log('Clicked!');"+ 
                                                "window.open('/zoom?data="+encodeURIComponent(val.message)+"','','top=100, left=100, width=500, height=400');"+                                                              
                                            "});"+
                                            "message.addEventListener('contextmenu', (event) => {"+ 
                                                "event.preventDefault();"+
                                                "navigator.clipboard.writeText(messageText.textContent).then(() => {"+
                                                    "console.log('Copied!');"+ 
                                                    "window.app.copiedSnackbar.MDCSnackbar.show({"+
                                                        "message: 'Copiado'"+
                                                    "});"+
                                                "}).catch((error) => {"+
                                                    "console.log(error);"+ 
                                                "})"+                                                                                                                         
                                            "});"+  
                                        "})();"
                    this.chatContent.appendChild(script);

                    var separator = document.createElement('li');
                    separator.setAttribute("role", "separator");
                    separator.setAttribute("class", "mdc-list-divider");
                    this.chatContent.appendChild(separator);
                }

                this.chatContent.scrollTop = this.chatContent.scrollHeight;

                return null;
            }).catch((error) => {
                console.log(error);
            });   
        } 
    }
    receiveMessage() {
        firebase.messaging().onMessage((payload) => {
            console.log('[main.js] Received Firebase Foreground Message');
            var data = payload.data;
            
            if (data) {
                if (data._from === this.session.id) {
                    var store = data._to;
                    var messageKey = data.messageKey;
                    var user = this.session.user;
                    var message = data.message;
                    var sended = data.sended;
                    var received = data.received;

                    if (this.currentChat.getAttribute("data-id") === store) {
                        var chat = document.getElementById(messageKey);
                        if (chat) {
                            chat.querySelector(".mdc-list-item__meta").textContent = sended+received;
                            this.chatContent.scrollTop = this.chatContent.scrollHeight;
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

                            var mdc_list_item = document.createElement('li');
                            mdc_list_item.setAttribute("class", "mdc-list-item");
                            mdc_list_item.setAttribute("id", messageKey);
                            mdc_list_item.setAttribute("style", "height: unset; padding: 16px 16px;");
                            mdc_list_item.innerHTML =   '<span class="mdc-list-item__text" style="white-space: initial; word-wrap: break-word;">'+ 
                                                            '<b>'+user+'</b></br><div id="'+messageKey+'/text">'+message+'</div>'+
                                                            '<span class="mdc-list-item__secondary-text" style="left: 12px;">['+time.day+'/'+time.month+'/'+time.year+' '+time.hours+':'+time.minutes+':'+time.seconds+']</span>'+
                                                        '</span>'+
                                                        '<span class="mdc-list-item__meta" style="position:absolute; bottom: 12px; right: 12px;">'+sended+received+'</span>';
                            this.chatContent.appendChild(mdc_list_item);

                            var script = document.createElement("script");
                            script.innerHTML = "(function() {"+
                                                    "var message = document.getElementById('"+messageKey+"');"+
                                                    "var messageText = document.getElementById('"+messageKey+"/text');"+                                    
                                                    "message.addEventListener('click', (event) => {"+    
                                                        "console.log('Clicked!');"+ 
                                                        "window.open('/zoom?data="+encodeURIComponent(message)+"','','top=100, left=100, width=500, height=400');"+                                                               
                                                    "});"+
                                                    "message.addEventListener('contextmenu', (event) => {"+ 
                                                        "event.preventDefault();"+
                                                        "navigator.clipboard.writeText(messageText.textContent).then(() => {"+
                                                            "console.log('Copied!');"+ 
                                                            "window.app.copiedSnackbar.MDCSnackbar.show({"+
                                                                "message: 'Copiado'"+
                                                            "});"+
                                                        "}).catch((error) => {"+
                                                            "console.log(error);"+ 
                                                        "})"+                                                                                                                         
                                                    "});"+  
                                                "})();"
                            this.chatContent.appendChild(script);

                            var separator = document.createElement('li');
                            separator.setAttribute("role", "separator");
                            separator.setAttribute("class", "mdc-list-divider");
                            this.chatContent.appendChild(separator);
                            
                            this.chatContent.scrollTop = this.chatContent.scrollHeight;
                            this.messageInput.value = "";

                        }
                    } 

                    this.contentProvider.updateMessage(this.session.id, store, messageKey, user, message, sended, received).catch((error) => {
                        console.log(error);
                    });
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
                    var messageKey = this.database.ref().push().key;
                    var user = document.getElementById(store).querySelector(".mdc-list-item").getAttribute('data-user');
                    var message = data.message;

                    if (this.currentChat.getAttribute("data-id") === store) {
                        var mdc_list_item = document.createElement('li');
                        mdc_list_item.setAttribute("class", "mdc-list-item");
                        mdc_list_item.setAttribute("id", messageKey);
                        mdc_list_item.setAttribute("style", "height: unset; padding: 16px 16px;");
                        mdc_list_item.innerHTML =   '<span class="mdc-list-item__text" style="white-space: initial; word-wrap: break-word;">'+ 
                                                        '<b>'+user+'</b></br><div id="'+messageKey+'/text">'+message+'</div>'+
                                                        '<span class="mdc-list-item__secondary-text" style="left: 12px;">['+time.day+'/'+time.month+'/'+time.year+' '+time.hours+':'+time.minutes+':'+time.seconds+']</span>'+
                                                    '</span>'+
                                                    '<span class="mdc-list-item__meta" style="position:absolute; bottom: 12px; right: 12px;"></span>';
                        this.chatContent.appendChild(mdc_list_item);

                        var script = document.createElement("script");
                        script.innerHTML = "(function() {"+
                                                "var message = document.getElementById('"+messageKey+"');"+
                                                "var messageText = document.getElementById('"+messageKey+"/text');"+                                    
                                                "message.addEventListener('click', (event) => {"+    
                                                    "console.log('Clicked!');"+ 
                                                    "window.open('/zoom?data="+encodeURIComponent(message)+"','','top=100, left=100, width=500, height=400');"+                                                               
                                                "});"+
                                                "message.addEventListener('contextmenu', (event) => {"+ 
                                                    "event.preventDefault();"+
                                                    "navigator.clipboard.writeText(messageText.textContent).then(() => {"+
                                                        "console.log('Copied!');"+ 
                                                        "window.app.copiedSnackbar.MDCSnackbar.show({"+
                                                            "message: 'Copiado'"+
                                                        "});"+
                                                    "}).catch((error) => {"+
                                                        "console.log(error);"+ 
                                                    "})"+                                                                                                                         
                                                "});"+                                                                                                  
                                            "})();"
                        this.chatContent.appendChild(script);

                        var separator = document.createElement('li');
                        separator.setAttribute("role", "separator");
                        separator.setAttribute("class", "mdc-list-divider");
                        this.chatContent.appendChild(separator);
                        
                        this.chatContent.scrollTop = this.chatContent.scrollHeight;
                        this.messageInput.value = "";
                    } else {
                        var options = {
                            body: user+' te ha escrito',
                            icon: '/img/ic_launcher.png',
                            requireInteraction: true, 
                            tag: user
                        }
                        new Notification("¡NUEVO MENSAJE!", options);
                    }

                    this.database.ref('Messages/'+store+'/'+this.session.id+'/'+data.messageKey).remove();

                    this.contentProvider.addMessage(this.session.id, store, messageKey, user, message, time).catch((error) => {
                        console.log(error);
                    });
                }
            }
        });
    }
    addContacts(user, id) {
        var container = document.createElement("div");
        container.setAttribute("class","mdc-menu-anchor");
        container.setAttribute("id", id);
        container.innerHTML =   '<li class="mdc-list-item" style="height: unset; padding: 16px 16px;">'+
                                    '<span class="mdc-list-item__text"></span>'+
                                    '<a class="mdc-list-item__meta material-icons" style="text-decoration:none; margin-left:auto; color: #222222; border: none; background-color: transparent; outline: none; cursor: pointer;">more_vert</a>'+    
                                '</li>'+
                                '<div class="mdc-menu" data-mdc-auto-init="MDCMenu" tabindex="-1" style="min-width:30px; float:right; top:0px; left:unset !important; right:5px !important; margin-top: -0.5em;">'+
                                    '<ul class="mdc-menu__items mdc-list" role="menu" aria-hidden="true">'+
                                        '<li class="mdc-list-item" role="menuitem" tabindex="0">Borrar contacto</li>'+
                                    '</ul>'+
                                '</div>'
        container.querySelector(".mdc-list-item__text").textContent = user;
        container.querySelector(".mdc-list-item").setAttribute("data-id", id);
        container.querySelector(".mdc-list-item").setAttribute("data-user", user);
        container.querySelector(".mdc-list-item__meta").setAttribute("data-id", id);
        this.contactsMenu.appendChild(container);

        var script1 = document.createElement("script");
        script1.innerHTML = "(function() {"+
                                "var div = document.getElementById('"+id+"');"+
                                "var contactLabel = div.querySelector('.mdc-list-item');"+
                                "contactLabel.addEventListener('click', () => {"+
                                    "console.log('contactLabel.click');"+
                                    "window.app.deleteMessagesButton.removeAttribute('disabled');"+
                                    "window.app.messageInput.removeAttribute('disabled');"+
                                    "window.app.sendButton.removeAttribute('disabled');"+
                                    "var user = contactLabel.getAttribute('data-user');"+
                                    "var id = contactLabel.getAttribute('data-id');"+
                                    "window.app.updateUI(user, id);"+
                                "})"+
                            "})();"
        this.contactsMenu.appendChild(script1);

        var script2 = document.createElement("script");
        script2.innerHTML = "(function() {"+
                                "var div = document.getElementById('"+id+"');"+
                                "var deleteButton = div.querySelector('.mdc-list-item__meta');"+
                                "var deleteMenu = div.querySelector('.mdc-menu');"+
                                "var mdcMenu = new mdc.menu.MDCMenu(deleteMenu);"+
                                "deleteButton.addEventListener('click', () => {"+
                                    "console.log('deleteButton.click');"+
                                    "event.cancelBubble = true;"+
                                    "mdcMenu.open = !mdcMenu.open;"+
                                "});"+
                                "mdcMenu.quickOpen = true;"+
                                "deleteMenu.addEventListener('MDCMenu:selected', (evt) => {"+
                                    "var id = deleteButton.getAttribute('data_id');"+
                                    "window.app.contentProvider.deleteStore('"+window.app.session.id+"','"+id+"').then(() => {"+
                                        "return window.app.contentProvider.deleteContact('"+window.app.session.id+"','"+id+"');"+
                                    "}).then(() => {"+
                                        "window.app.updateContactsMenu();"+
                                        "return null;"+
                                    "}).catch((error) => {"+
                                        "console.log(error);"+
                                    "})"+
                                "});"+
                            "})();"
        this.contactsMenu.appendChild(script2);
        
        var separator = document.createElement('li');
        separator.setAttribute("role", "separator");
        separator.setAttribute("class", "mdc-list-divider");
        this.contactsMenu.appendChild(separator);




        this.contentProvider.addStore(this.session.id, id).then((db) => {
            return this.contentProvider.addContact(user, this.session.id, id);
        }).then(() => {
            this.updateContactsMenu();
            return null;
        }).catch((error) => {
            console.log(error);
        });
    }
    updateContactsMenu() {
        this.contentProvider.getCursor(this.session.id, "contacts").then((contacts) => {
            this.contactsMenu.innerHTML = "";

            for (var i=0; i<contacts.length; i++) {
                var val = contacts[i];
                var id = val.id;
                var user = val.user;  
                
                var container = document.createElement("div");
                container.setAttribute("class","mdc-menu-anchor");
                container.setAttribute("id", id);
                container.innerHTML =   '<li class="mdc-list-item" style="height: unset; padding: 16px 16px;">'+
                                            '<span class="mdc-list-item__text"></span>'+
                                            '<a class="mdc-list-item__meta material-icons" style="text-decoration:none; margin-left:auto; color: #222222; border: none; background-color: transparent; outline: none; cursor: pointer;">more_vert</a>'+    
                                        '</li>'+
                                        '<div class="mdc-menu" data-mdc-auto-init="MDCMenu" tabindex="-1" style="min-width:30px; float:right; top:0px; left:unset !important; right:5px !important; margin-top: -0.5em;">'+
                                            '<ul class="mdc-menu__items mdc-list" role="menu" aria-hidden="true">'+
                                                '<li class="mdc-list-item" role="menuitem" tabindex="0">Borrar contacto</li>'+
                                            '</ul>'+
                                        '</div>'
                container.querySelector(".mdc-list-item__text").textContent = user;
                container.querySelector(".mdc-list-item").setAttribute("data-id", id);
                container.querySelector(".mdc-list-item").setAttribute("data-user", user);
                container.querySelector(".mdc-list-item__meta").setAttribute("data-id", id);
                this.contactsMenu.appendChild(container);

                var script1 = document.createElement("script");
                script1.innerHTML = "(function() {"+
                                        "var div = document.getElementById('"+id+"');"+
                                        "var contactLabel = div.querySelector('.mdc-list-item');"+
                                        "contactLabel.addEventListener('click', () => {"+
                                            "console.log('contactLabel.click');"+
                                            "window.app.deleteMessagesButton.removeAttribute('disabled');"+
                                            "window.app.messageInput.removeAttribute('disabled');"+
                                            "window.app.sendButton.removeAttribute('disabled');"+
                                            "var user = contactLabel.getAttribute('data-user');"+
                                            "var id = contactLabel.getAttribute('data-id');"+
                                            "window.app.updateUI(user, id);"+
                                        "})"+
                                    "})();"
                this.contactsMenu.appendChild(script1);

                var script2 = document.createElement("script");
                script2.innerHTML = "(function() {"+
                                        "var div = document.getElementById('"+id+"');"+
                                        "var deleteButton = div.querySelector('.mdc-list-item__meta');"+
                                        "var deleteMenu = div.querySelector('.mdc-menu');"+
                                        "var mdcMenu = new mdc.menu.MDCMenu(deleteMenu);"+
                                        "deleteButton.addEventListener('click', (event) => {"+
                                            "console.log('deleteButton.click');"+
                                            "event.cancelBubble = true;"+
                                            "mdcMenu.open = !mdcMenu.open;"+
                                        "});"+
                                        "mdcMenu.quickOpen = true;"+
                                        "deleteMenu.addEventListener('MDCMenu:selected', (evt) => {"+
                                            "var id = deleteButton.getAttribute('data_id');"+
                                            "window.app.contentProvider.deleteStore('"+window.app.session.id+"','"+id+"').then(() => {"+
                                                "return window.app.contentProvider.deleteContact('"+window.app.session.id+"','"+id+"');"+
                                            "}).then(() => {"+
                                                "window.app.updateContactsMenu();"+
                                                "return null;"+
                                            "}).catch((error) => {"+
                                                "console.log(error);"+
                                            "})"+
                                        "});"+
                                    "})();"
                this.contactsMenu.appendChild(script2);
                
                var separator = document.createElement('li');
                separator.setAttribute("role", "separator");
                separator.setAttribute("class", "mdc-list-divider");
                this.contactsMenu.appendChild(separator);
            }

            return null;
        }).catch((error) => {
            console.log(error);
        });
    }
    updateReceiver() {
        this.serviceWorker.addEventListener('message', event => {
            if (event.data["firebase-messaging-msg-type"] === "push-msg-received-background") {
                console.log('[main.js] Received Message From Service Worker: '+event.data);
                console.log(event);
                var data = event.data["firebase-messaging-msg-data"]["data"];
                if (this.currentChat.getAttribute("data-id") === data._from || this.currentChat.getAttribute("data-id") === data._to) {
                    console.log('[main.js] Service Worker: Update Current Chat');
                    var user = this.currentChat.getAttribute("data-user");
                    var id = this.currentChat.getAttribute("data-id");
                    this.updateUI(user, id);
                }
            }
        });
    }
}

window.addEventListener("load", () => {
    var session = JSON.parse(decodeURIComponent(document.cookie.split("=")[1]));
    var contentProvider = new ContentProvider("innerdatabase.db");
    contentProvider.addDB().then(() => {
        return contentProvider.addStore("", "__session");
    }).then(() => {
        return contentProvider.addStore(session.id, "contacts");
    }).then(() => {
        return contentProvider.addSession(session);
    }).then(() => {
        window.app = new ChatApp(window, contentProvider, session);
        window.app.updateContactsMenu();
        return null;
    }).catch((error) => {
        console.log(error);
    })



});


