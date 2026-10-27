document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".spieler-bild").forEach(function (bild) {
        bild.addEventListener("click", function () {
            var id = bild.getAttribute("data-popup");
            var popup = document.getElementById("popup-" + id);
            if (popup) {
                popup.style.display = "flex";
            }
        });
    });

    document.querySelectorAll(".close-popup").forEach(function (btn) {
        btn.addEventListener("click", function () {
            btn.closest(".player-popup-overlay").style.display = "none";
        });
    });
});