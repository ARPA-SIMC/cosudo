
  function openGraphWind(urlDirWind, urlSpeedWind, overlay) {
    $.ajax({
      url: urlDirWind,
      dataType: "json",
      success: function (windDirectionData) {
        $.ajax({
          url: urlSpeedWind,
          dataType: "json",
          success: function (windSpeedData) {
            let dataWindSpeedDByDir = {};
            windSpeedData.forEach((speedValue) => {
              windDirectionData.forEach((directionValue) => {
                if (
                  speedValue.date === directionValue.date &&
                  speedValue.ident === directionValue.ident &&
                  speedValue.lon === directionValue.lon &&
                  speedValue.lat === directionValue.lat &&
                  speedValue.network === directionValue.network
                ) {
                  let speed = speedValue.data[0].vars["B11002"].v;
                  let key = windClassification(speed);
                  if (!(key in dataWindSpeedDByDir)) {
                    dataWindSpeedDByDir[key] = {
                      dir: {
                        N: { total: 0 },
                        NNE: { total: 0 },
                        NE: { total: 0 },
                        ENE: { total: 0 },
                        E: { total: 0 },
                        ESE: { total: 0 },
                        SE: { total: 0 },
                        SSE: { total: 0 },
                        S: { total: 0 },
                        SSW: { total: 0 },
                        SW: { total: 0 },
                        WSW: { total: 0 },
                        W: { total: 0 },
                        WNW: { total: 0 },
                        NW: { total: 0 },
                        NNW: { total: 0 },
                      },
                      total: 0,
                    };
                  }
                  let direction = degToCompass(
                    directionValue.data[0].vars["B11001"].v
                  );
                  dataWindSpeedDByDir[key].dir[direction].total += 1;
                  dataWindSpeedDByDir[key].total += 1;
                }
              });
            });
            let dataSpeedAverage = [];
            let i = 0;
            for (let key in dataWindSpeedDByDir) {
              dataSpeedAverage.push({
                r: Object.keys(dataWindSpeedDByDir[key].dir).map(function (
                  keyDir
                ) {
                  return (
                    (dataWindSpeedDByDir[key].dir[keyDir].total /
                      dataWindSpeedDByDir[key].total) *
                    100
                  );
                }),
                theta: Object.keys(dataWindSpeedDByDir[key].dir),
                name: key,
                marker: { color: windColors[i] },
                type: "barpolar",
              });
              i++;
            }
            let dataDict = {
              N: 0,
              NNE: 0,
              NE: 0,
              ENE: 0,
              E: 0,
              ESE: 0,
              SE: 0,
              SSE: 0,
              S: 0,
              SSW: 0,
              SW: 0,
              WSW: 0,
              W: 0,
              WNW: 0,
              NW: 0,
              NNW: 0,
            };
            windDirectionData.forEach((data) => {
              dataDict[degToCompass(data.data[0].vars["B11001"].v)] += 1;
            });
            $("#modalWindRose").modal("show");
            let data = [
              {
                r: Object.keys(dataDict).map(function (key) {
                  return dataDict[key];
                }),
                theta: Object.keys(dataDict),
                name: "11-14 m/s",
                marker: { color: getRandomColor() },
                type: "barpolar",
              },
            ];
            let layout = {
              title: "Wind Direction Distribution",
              font: { size: 16 },
              legend: { font: { size: 16 } },
              polar: {
                radialaxis: { angle: 90 },
                angularaxis: { direction: "clockwise" },
              },
              autosize: true,
            };
            let layoutSpeed = {
              title: "Wind Speed Distribution",
              font: { size: 16 },
              legend: { font: { size: 16 } },
              showlegend: true,
              polar: {
                barmode: "overlay",
                bargap: 0,
                radialaxis: { ticksuffix: "%", angle: 90, dtick: 20 },
                angularaxis: { direction: "clockwise" },
              },
              autosize: true,
            };
            Plotly.newPlot(
              document.getElementById("windRoseContainer"),
              data,
              layout
            );
            Plotly.newPlot(
              document.getElementById("windRoseSpeedContainer"),
              dataSpeedAverage,
              layoutSpeed
            );
          },
          beforeSend: function () {
            overlay.fadeIn(300);
          },
          complete: function () {
            overlay.fadeOut(300);
          },
        });
      },
      beforeSend: function () {
        overlay.fadeIn(300);
      },
      complete: function () {
        overlay.fadeOut(300);
      },
    });
  }