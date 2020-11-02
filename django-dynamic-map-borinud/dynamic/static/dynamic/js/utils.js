Chart.plugins.register({
    beforeDraw: function (c) {
        let ctx = c.chart.ctx;
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
                for (let key in this.options.style) {
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

L.Control.Layers.include({
    getActiveOverlays: function () {

        // Create array for holding active layers
        let active = [];
        let control = this;

        // Iterate all layers in control
        control._layers.forEach(function (obj) {
            // Check if it's an overlay and added to the map
            if (obj.overlay && control._map.hasLayer(obj.layer)) {
                // Push layer to active array
                active.push(obj.layer);
            }
        });

        // Return array
        return active;
    }
});
Chart.defaults.global.legend.display = false;
let colors = ['#3030ff', '#007885', '#00855D', '#0D8500', '#478500', '#788500', '#853C00', '#850000'];

function getColorIndex(d, min, max) {
    let delta = (max - min) / (colors.length);
    return Math.max(0, Math.min(colors.length - 1, Math.floor((d - min) / delta)));
}


function getColor(d, min, max) {
    return colors[getColorIndex(d, min, max)];
}

function null2_(i) {
    return (i === null) ? "-" : i;
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function degToCompass(num) {
    let val = Math.floor((num / 22.5) + 0.5);
    let arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function getIndexCompass(num) {
    return Math.round(num / 45) % 8;
}

function windClassification(speedValue) {
    if (speedValue <= 5) {
        return "0-5 m/s"
    } else if (speedValue > 5 && speedValue <= 20) {
        return "6-20 m/s"
    } else if (speedValue > 20) {
        return ">20 m/s"
    }
}

let windColors = ["rgb(203,201,226)", "rgb(158,154,200)", "rgb(106,81,163)"]

/*
    $("#sidebar").resizable({
        handles: 'e', stop: function (e, ui) {
            widthMenu = document.getElementById('sidebar').offsetWidth;
        }
    });
*/