Chart.plugins.register({
    beforeDraw: function (c) {
        var ctx = c.chart.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, c.chart.width, c.chart.height);
    }
});
(function (L) {
    /*
    * by tonekk. 2014, MIT License
    */

    L.ExtendedDivIcon = L.DivIcon.extend({
        createIcon: function (oldIcon) {
            let div = L.DivIcon.prototype.createIcon.call(this, oldIcon);

            if (this.options.id) {
                div.id = this.options.id;
            }

            if (this.options.style) {
                for (var key in this.options.style) {
                    div.style[key] = this.options.style[key];
                }
            }
            return div;
        }
    });

    L.extendedDivIcon = function (options) {
        return new L.ExtendedDivIcon(options);
    }
})(window.L);
Chart.defaults.global.legend.display = false;
var colors = ['#8501af', '#3e01a3', '#2147fe', '#3192ce', '#65b032', '#cfea2d', '#fdfd47', '#f9bc00', '#f79904', '#f55306', '#f52613', '#a8184b'];

function getColorIndex(d, min, max) {
    var delta = (max - min) / (colors.length);
    return Math.max(0, Math.min(colors.length - 1, Math.floor((d - min) / delta)));
}


function getColor(d, min, max) {
    return colors[getColorIndex(d, min, max)];
}

function null2_(i) {
    return (i === null) ? "-" : i;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
/*
    $("#sidebar").resizable({
        handles: 'e', stop: function (e, ui) {
            widthMenu = document.getElementById('sidebar').offsetWidth;
        }
    });
*/