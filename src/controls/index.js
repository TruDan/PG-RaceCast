/**
 * Created by truda on 10/05/2017.
 */
const CastSenderClient = require('./cast');

$(function() {
    var DEEPSTREAM_URL = window.location.hostname + ':3002';
    var id;
    var gameId;
    var name;
    var recordName;
    var record;
    var ds;
    var ingame = false;

    // Join the game, either initially or after
    // the player's ship was destroyed and they hit
    // play again
    function joinGame() {
        name = $('input#name').val();
        gameId = $('input#gameid').val().toUpperCase();
        id = ds.getUid();
        recordName = 'player/' + id;

        // Retrieve the record for the player's control data. When the record
        // was deleted previously it will be created again here
        ds.record.getRecord(recordName).whenReady(function (r) {

            record = r;
            setSize();

            record.set({
                id: id,
                gameId: gameId,
                name: name,
                active: false,
                direction: -1,
            });

            record.once('delete', function () {
                ingame = false;
                // Show the gameover screen
                $('#tabs-controls').tabs('select_tab', 'game-over');

                // Bind play again button
                $('#game-over button').one('touch click', joinGame);

                // Unsubscribe from the satus event (the same happens if the
                // client goes offline)
                ds.event.unsubscribe('status/' + gameId + "/" + id);
            });

            ds.event.subscribe('status/' + gameId + "/" + id, function () {
            });

            // That's it, we're in!
            $('#tabs-controls').tabs('select_tab', 'controls');
            ingame = true;
        });
    }

    function newGame() {
        $castSender.requestSession();
    }

    // Called once the client loads
    function startApp() {

        // Once the user has entered their name, join the game
        $('#join-game').submit(function (event) {
            event.preventDefault();
            joinGame();
        });

        $('#new-game').submit(function(event) {
            event.preventDefault();
            newGame();
        })
    }

    // Create the connection to the deepstream server and login straight away
    // Replace the IP with the one for your own server
    ds = deepstream(DEEPSTREAM_URL).login({}, startApp);

    // Listen for connection state changes. Deepstream has 11 different connection states,
    // but we've only got three colors - so we need to normalize things a bit
    ds.on('connectionStateChanged', function (connectionState) {
        var cssClass;

        if (connectionState === 'ERROR' || connectionState === 'CLOSED') {
            cssClass = 'disconnected';
        }
        else if (connectionState === 'OPEN') {
            cssClass = 'connected';
        }
        else {
            cssClass = 'warn';
        }

        $('.connection-indicator').removeClass('connected warn disconnected').addClass(cssClass);
    });

    $('#tabs-controls').tabs({
        onShow: setSize
    });

    function setSize() {
        var divWidth = $('.card.card-dpad .card-content').width();
        $('.card.card-dpad .card-content').height(divWidth);
        $('.card.card-dpad .card-content i.material-icons').css('font-size', (divWidth / 3) - 20 + "px").css('line-height', (divWidth / 3) - 20 + "px");
    }

    setSize();

    $(window).resize(function(){
        setSize();
    });

    $( window ).keypress(function( event ) {
        console.log(event);
        if(!ingame) return;

        if ( event.key === "a" ) {
            event.preventDefault();
            record.set('active',true);
            record.set( "direction", 3 );
        }
        if ( event.key === "d" ) {
            event.preventDefault();
            record.set('active',true);
            record.set( "direction", 4 );
        }
        if ( event.key === "w" ) {
            event.preventDefault();
            record.set('active',true);
            record.set( "direction", 1 );
        }
        if ( event.key === "s" ) {
            event.preventDefault();
            record.set('active',true);
            record.set( "direction", 2 );
        }
    });

    $('#direction_up').on('touchstart mousedown', function() {
        if(!ingame) return;
        record.set('active',true);
        record.set( "direction", 1 );
    });
    $('#direction_down').on('touchstart mousedown', function() {
        if(!ingame) return;
        record.set('active',true);
        record.set( "direction", 2 );
    });
    $('#direction_left').on('touchstart mousedown', function() {
        if(!ingame) return;
        record.set('active',true);
        record.set( "direction", 3 );
    });
    $('#direction_right').on('touchstart mousedown', function() {
        if(!ingame) return;
        record.set('active',true);
        record.set( "direction", 4 );
    });

    function updateCollapsible(el) {
        $('.collapsible:has(li.active)').addClass('collapsible-open');
        $('.collapsible:not(:has(li.active))').removeClass('collapsible-open');
    }

    $('.collapsible').collapsible({
        onOpen: updateCollapsible,
        onClose: updateCollapsible
    });

    $('.cast-icon').html('<svg width="24" height="24" viewBox="0 0 24 24"><path id="a" d="M1 18L1 21 4 21C4 19.3 2.7 18 1 18L1 18Z"/><path id="b" d="M1 14L1 16C3.8 16 6 18.2 6 21L8 21C8 17.1 4.9 14 1 14L1 14Z"/><path id="c" d="M1 10L1 12C6 12 10 16 10 21L12 21C12 14.9 7.1 10 1 10L1 10Z"/><path id="d" d="M21 3L3 3C1.9 3 1 3.9 1 5L1 8 3 8 3 5 21 5 21 19 14 19 14 21 21 21C22.1 21 23 20.1 23 19L23 5C23 3.9 22.1 3 21 3L21 3Z"/><path id="e" d="M5 7L5 8.6C8 8.6 13.4 14 13.4 17L19 17 19 7Z"/></svg>');
});

var $castSender = new CastSenderClient('446A1F3D', ['games.pika.papercast']);

var eventListener = function(castSender, session, sessionState) {
    var iconClass = "";
    switch (sessionState) {
        case cast.framework.SessionState.NO_SESSION:
            iconClass = "cast-inactive";
            break;
        case cast.framework.SessionState.SESSION_STARTING:
            iconClass = "cast-connect";
            break;
        case cast.framework.SessionState.SESSION_STARTED:
            iconClass = "cast-active";
            break;
        case cast.framework.SessionState.SESSION_START_FAILED:
            iconClass = "cast-warn";
            break;
        case cast.framework.SessionState.SESSION_ENDING:
            iconClass = "cast-inactive";
            break;
        case cast.framework.SessionState.SESSION_ENDED:
            iconClass = "cast-inactive";
            break;
        case cast.framework.SessionState.SESSION_RESUMED:
            iconClass = "cast-active";
            break;
    }

    $('.cast-icon').removeClass('cast-inactive cast-warn cast-connect cast-active').addClass(iconClass);
};

$castSender.onInit(function() {
    $castSender.registerListener(eventListener, true);
});