document.addEventListener('DOMContentLoaded', function () {
    let startX;
    const container = document.querySelector('.container');
    const rightSection = document.querySelector('.right-section');

    container.addEventListener('touchstart', function (event) {
        startX = event.touches[0].pageX;
    }, false);

    container.addEventListener('touchmove', function (event) {
        var moveX = event.touches[0].pageX;
        var diffX = startX - moveX;
        
        if (diffX > 30) { // A right swipe
            rightSection.style.display = 'flex';
        } else if (diffX < -30) { // A left swipe
            rightSection.style.display = 'none';
        }
    }, false);
});