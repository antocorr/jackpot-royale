const formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
})
let lastUpdate = Date.now();
$(function () {
    var socket = io();

    socket.emit('join-game', gameId, userId);
    $(".bet-buttons:not(.disabled)").on("click", "a", function () {
        var amount = $(this).attr("data-amount");
        socket.emit("place-bet", amount);
        console.log("bet placed: ", amount);
        return false;
    })
    socket.on('new-jackpot', function (j) {
        console.log("new jackpot: ", j)
        $("#current-amount").html(formatter.format(j))
    })
    socket.on('ping-clients', function () {
        console.log("new update from server: ");
        lastUpdate = Date.now();
        $(".indicator").removeClass("red");
        $(".indicator").addClass("green");
        $(".bet-buttons").removeClass("disabled");
    })
    setInterval(function () {
        if (lastUpdate) {
            if (Date.now() - lastUpdate > 6000) {
                console.log("no updates in long time...")
                $(".indicator").removeClass("green");
                $(".indicator").addClass("red");
                $(".bet-buttons").addClass("disabled");
            }
        }
    }, 5000);
})