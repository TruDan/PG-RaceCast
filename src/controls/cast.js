/**
 * Created by truda on 12/05/2017.
 */

module.exports = function CastSenderClient(appId, messageNamespaces) {
    var $castSender = this;
    var config = {
        applicationId: appId,
        namespaces: messageNamespaces || []
    };

    var isInitialised = false;
    var initFuncs = [];

    var context;

    var eventListeners = [];
    var sessionState = "";
    var session;

    var messageListeners = {};
    var receiver;


    /**
     * initialization error callback
     */
    var onError = function(message) {
        console.log('onError: ' + JSON.stringify(message));
    };

    /**
     * generic success callback
     */
    var onSuccess = function(message) {
        console.log('onSuccess: ' + message);
    };

    this.onInit = function(callback) {
        if(isInitialised) {
            callback();
            return;
        }
        initFuncs.push(callback);
    };

    this.init = function() {
        context = cast.framework.CastContext.getInstance();
        context.setOptions({
            receiverApplicationId: config.applicationId,
            autoJoinPolicy: chrome.cast.ORIGIN_SCOPED,
            resumeSavedSession: true
        });

        session = context.getCurrentSession();
        sessionState = context.getSessionState();
        context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, CastSessionStateListener);

        console.debug("Cast Sender Initialised");
        isInitialised = true;
        if(initFuncs.length > 0) {
            for(var i=0; i < initFuncs.length; i++) {
                initFuncs[i]();
            }
        }
    };

    this.requestSession = function() {
        return context.requestSession();
    };

    this.registerListener = function(listenerCallback, forceInit) {
        eventListeners.push(listenerCallback);
        if(session !== null || (typeof(forceInit) !== 'undefined' && forceInit))
            listenerCallback($castSender, session, sessionState);
    };

    this.unregisterListener = function(listenerCallback) {
        if(eventListeners.length > 0) {
            for (var i = 0; i < eventListeners.length; i++) {
                var listener = eventListeners[i];
                if (listener && listener === listenerCallback) {
                    eventListeners.splice(i, 1);
                }
            }
        }
    };

    this.sendMessage = function(namespace, message) {
        var s = context.getCurrentSession();
        if (s !== null) {
            console.log("Cast: SEND - ", namespace, message);
            return s.sendMessage(namespace, message).then(onSuccess, onError)
        }
    };

    this.getConfig = function() {
        return $.extend(true, {}, config);
    };

    this.getReceiverName = function() {
        return receiver.friendlyName;
    };

    this.getSessionState = function() {
        return sessionState;
    };

    function CastSessionStateListener(e) {
        if(e.errorCode !== null) {
            console.warn("Cast Error", e.errorCode, e.sessionState, e.session);
        }

        if(e.sessionState !== sessionState) {
            console.debug("Cast State Change", sessionState, e.sessionState, e.session, e.errorCode);

            session = e.session;
            if(session !== null)
                receiver = session.getCastDevice();
            else
                receiver = null;

            switch (e.sessionState) {
                case cast.framework.SessionState.NO_SESSION:

                    break;
                case cast.framework.SessionState.SESSION_STARTING:

                    break;
                case cast.framework.SessionState.SESSION_STARTED:

                    console.log("Session", session);
                    if(config.namespaces.length > 0) {
                        for(var i=0;i<config.namespaces.length;i++) {
                            var ns = config.namespaces[i];

                            messageListeners[ns] = new CastSenderMessageListener(ns);
                            console.log("Cast: REGL - ", ns);
                        }
                    }

                    break;
                case cast.framework.SessionState.SESSION_START_FAILED:

                    break;
                case cast.framework.SessionState.SESSION_ENDING:

                    break;
                case cast.framework.SessionState.SESSION_ENDED:

                    break;
                case cast.framework.SessionState.SESSION_RESUMED:

                    break;
            }

            if(eventListeners.length > 0) {
                for(var i =0;i<eventListeners.length;i++) {
                    eventListeners[i]($castSender, session, e.sessionState);
                }
            }

            sessionState = e.sessionState;
        }
    }

    this.registerMessageListener = function(namespace, listenerCallback) {
        if(typeof(messageListeners[namespace]) === 'undefined') {
            console.error("Attempted to register message listener on a namespace that has not been registered.", namespace);
            return;
        }

        messageListeners[namespace].registerListener(listenerCallback);
    };

    function CastSenderMessageListener(namespace) {
        this.namespace = namespace;

        var messageListeners = [];

        function onMessage(namespace, message) {
            console.log('Cast: RECV - ', namespace, message);

            if(messageListeners.length > 0) {
                for(var i=0; i < messageListeners.length; i++) {
                    messageListeners[i]($castSender, message);
                }
            }
        }

        this.registerListener = function(listenerCallback) {
            messageListeners.push(listenerCallback);
        };

        this.sendMessage = function(message) {
            $castSender.sendMessage(namespace, message);
        };

        session.addMessageListener(namespace, onMessage);
    }

    window['__onGCastApiAvailable'] = function(isAvailable) {
        if (isAvailable) {
            $castSender.init();
        }
    };

    if(typeof(cast) !== 'undefined') {
        this.init();
    }
}