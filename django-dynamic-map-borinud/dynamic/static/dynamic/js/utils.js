Chart.plugins.register({
    beforeDraw: function (c) {
        var ctx = c.chart.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, c.chart.width, c.chart.height);
    }
});
Chart.defaults.global.legend.display = false;
var colors = ['#8501af', '#3e01a3', '#2147fe', '#3192ce', '#65b032', '#cfea2d', '#fdfd47', '#f9bc00', '#f79904', '#f55306', '#f52613', '#a8184b'];
