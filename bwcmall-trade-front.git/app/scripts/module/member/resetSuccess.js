var countDown = 4;

var t1 = setInterval(function () {
    $('#countDown').html(countDown);
    if (countDown <= 1) {
        location.href = '/member/login.html';
    }
    else {
        countDown--;
    }
}, 1000);