let AlarmView = function (alarmCollection, map, valueSelection, sidebar) {
  this.data = alarmCollection;
  this.nextUrl = null;
  this.prevUrl = null;
  this.map = map;
  this.markers = [];
  this.valueSelection = valueSelection;
  this.sidebar = sidebar;
  this.lastUrl = "/dynamic/alarms?status=a";
};

AlarmView.prototype.initEvents = function () {
  const self = this;
  const networkSel = $("#networkAlarm");
  const varSel = $("#varAlarm");

  self.publishers();
  self.subscribers();

  $("#startDateFirstPeriod").datetimepicker({
    widgetPositioning: {
      horizontal: "left",
      vertical: "bottom",
    },
    defaultDate: new Date(),
    locale: "it",
  });

  $("#startDateSecondPeriod").datetimepicker({
    widgetPositioning: {
      horizontal: "left",
      vertical: "bottom",
    },
    defaultDate: new Date(),
    locale: "it",
  });

  $("#endDateFirstPeriod").datetimepicker({
    widgetPositioning: {
      horizontal: "left",
      vertical: "bottom",
    },
    defaultDate: new Date(),
    locale: "it",
  });

  $("#endDateSecondPeriod").datetimepicker({
    widgetPositioning: {
      horizontal: "left",
      vertical: "bottom",
    },
    defaultDate: new Date(),
    locale: "it",
  });

  self.valueSelection.networks.forEach((network) => {
    networkSel.append(`<option value="${network}" >${network}</option>`);
  });

  self.valueSelection.vars.forEach((varData) => {
    varSel.append(
      `<option value="${varData}" >${
        borinud.config.B[varData] !== undefined
          ? borinud.config.B[varData].description
          : varData
      }</option>`
    );
  });
  self.sidebar.on("content", function (e) {
    // e.id contains the id of the opened panel
    if (e.id === "alarms") {
      self.reload(self.lastUrl);
    } else {
      if (self.data.getAll().length > 0) $.Topic("alarm-remove-all").publish();
    }
  });

  $(document.body).on("click", "#comparePeriods", function () {
    let startDateFirstPeriod = moment(
      $("#startDateFirstPeriod").datetimepicker("viewDate")
    ).format("DD/MM/YYYY HH:mm:ss");
    let endDateFirstPeriod = moment(
      $("#endDateFirstPeriod").datetimepicker("viewDate")
    ).format("DD/MM/YYYY HH:mm:ss");
    let startDateSecondPeriod = moment(
      $("#startDateSecondPeriod").datetimepicker("viewDate")
    ).format("DD/MM/YYYY HH:mm:ss");
    let endDateSecondPeriod = moment(
      $("#endDateSecondPeriod").datetimepicker("viewDate")
    ).format("DD/MM/YYYY HH:mm:ss");
    $.ajax({
      url: `/dynamic/compare-summaries/`,
      method: "get",
      data: {
        startDateFirstPeriod: startDateFirstPeriod,
        endDateFirstPeriod: endDateFirstPeriod,
        startDateSecondPeriod: startDateSecondPeriod,
        endDateSecondPeriod: endDateSecondPeriod,
      },
      success: function (resp) {
        if (resp == "success") {
          toastr.success("Done!");
          self.reload(self.lastUrl);
        } else {
          toastr.error(resp);
        }
      },
      error: function (e) {
        toastr.error("Error!");
        console.log(e.toString());
      },
      beforeSend: function () {
        $("#overlay").fadeIn(300);
      },
      complete: function () {
        $("#overlay").fadeOut(300);
      },
    });
  });

  $(document.body).on("click", "#applyFilterAlarms", function () {
    let url = new URL(window.location.origin + "/dynamic/alarms/");
    let network = $("#networkAlarm").val();
    let varValue = $("#varAlarm").val();
    let status = parseInt($("input[name='statusAlarms']:checked").val());

    if (network !== "*") url.searchParams.append("network", network);
    if (varValue !== "*") url.searchParams.append("var", varValue);

    switch (status) {
      case 1:
        url.searchParams.append("status", "a");
        break;
      case 2:
        url.searchParams.append("status", "d");
        break;
      default:
        break;
    }
    self.lastUrl = url;
    self.reload(url);
  });

  $(document.body).on("click", ".deleteAlarm", function (e) {
    e.stopPropagation();
    let id = $(this).attr("data-id");
    let r = confirm("Do you want to delete this alarm?");
    if (r) {
      $.ajax({
        url: `/dynamic/alarms/${id}/`,
        method: "delete",
        success: function (resp) {
          toastr.success("Done!");
          self.reload(self.lastUrl);
        },
        error: function (e) {
          toastr.error("Error!");
          console.log(e.toString());
        },
      });
    }
  });

  $(document.body).on("click", ".enableAlarm", function (e) {
    e.stopPropagation();
    let id = $(this).attr("data-id");
    let r = confirm("Do you want to enable this alarm?");
    if (r) {
      $.ajax({
        url: `/dynamic/alarms/${id}/`,
        method: "put",
        contentType: "application/json",
        data: JSON.stringify({ status: "a" }),
        success: function (resp) {
          toastr.success("Done!");
          self.reload(self.lastUrl);
        },
        error: function (e) {
          toastr.error("Error!");
          console.log(e.toString());
        },
      });
    }
  });

  $(document.body).on("click", ".disableAlarm", function (e) {
    e.stopPropagation();
    let id = $(this).attr("data-id");
    let r = confirm("Do you want to disable this alarm?");
    if (r) {
      $.ajax({
        url: `/dynamic/alarms/${id}/`,
        method: "put",
        contentType: "application/json",
        data: JSON.stringify({ status: "d" }),
        success: function (resp) {
          toastr.success("Done!");
          self.reload(self.lastUrl);
        },
        error: function (e) {
          toastr.error("Error!");
          console.log(e.toString());
        },
      });
    }
  });

  $(document.body).on("click", "#tableAlarms tbody tr", function () {
    let id = $(this).attr("data-id");
    self.markers.forEach((marker) => {
      let blueIcon = new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      marker.setIcon(blueIcon);
    });
    let check = $(this).hasClass("bg-warning");
    $("#tableAlarms tbody tr").removeClass("bg-warning");
    if (!check) {
      $(this).addClass("bg-warning");
      self.markers.forEach((marker) => {
        marker.data.ids.forEach((id1) => {
          if (id1 === parseInt(id)) {
            let yellowIcon = new L.Icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });
            marker.setIcon(yellowIcon);
            self.map.panTo(marker.getLatLng());
          }
        });
      });
    }
  });
};

AlarmView.prototype.reload = function (url) {
  const self = this;
  $.ajax({
    url: url,
    dataType: "json",
    success: function (resp) {
      console.log();
      self.nextUrl = resp.next === null ? "" : resp.next;
      self.prevUrl = resp.previous === null ? "" : resp.previous;
      $.Topic("alarm-set").publish(resp.results);
    },
    error: function (e) {
      console.log(e.toString());
    },
  });
};

AlarmView.prototype.publishers = function () {
  const self = this;

  $("#prevAlarms, #nextAlarms").on("click", function () {
    let url = $(this).attr("data-url");
    self.reload(url);
  });
};

AlarmView.prototype.subscribers = function () {
  const self = this;

  $.Topic("alarm-add").subscribe(function () {
    self.render();
  });

  $.Topic("alarm-remove").subscribe(function () {
    self.render();
  });

  $.Topic("alarm-remove-all").subscribe(function () {
    self.render();
  });

  $.Topic("alarm-set").subscribe(function () {
    self.render();
  });
};

AlarmView.prototype.render = function () {
  const self = this;
  const dataCol = this.data.getAll();
  const listSel = $("#alarms-list");

  //clean from previous values
  listSel.html("");
  self.markers.forEach((marker) => self.map.removeLayer(marker));
  self.markers = [];

  //update table navigation buttons
  $("#prevAlarms").attr("data-url", self.prevUrl);
  $("#prevAlarms").prop("disabled", self.prevUrl === "");
  $("#nextAlarms").attr("data-url", self.nextUrl);
  $("#nextAlarms").prop("disabled", self.nextUrl === "");

  let innerTrs = "";
  let coords = [];

  dataCol.map((alarm, index) => {
    let enableButton = `<button data-id="${alarm.id}" class="btn btn-primary enableAlarm ml-1 btn-sm">Enable</button>`;
    let disableButton = `<button data-id="${alarm.id}" class="btn btn-primary disableAlarm ml-1 btn-sm">Disable</button>`;

    let button = alarm.status === "d" ? enableButton : disableButton;

    let lon = alarm.lon / 100000;
    let lat = alarm.lat / 100000;
    coords.push([lat, lon]);
    //let classColor = alarm.status === "a" ? "badge-success" : "badge-danger";
    let vars= alarm.var
     if (borinud.config.B[vars] !== undefined) {
        vars =
          borinud.config.B[vars].description +
          " " +
          borinud.config.B[vars].unit;
      }
      let level = alarm.level
      let [l1, l2, l3, l4] = borinud.config.level.decode(level);
      level = borinud.config.level.describe(l1, l2, l3, l4);

      let trange = alarm.trange
      console.log(alarm.trange)
      let [t1, t2, t3, t4] = borinud.config.trange.decode(trange);
      trange = borinud.config.trange.describe(t1, t2, t3, t4);
 
    let typeStr = alarm.status === "d" ? "Disabled" : "Active";
    innerTrs += `
    <tr data-id="${alarm.id}">
    <td>
    <div class="d-flex flex-row justify-content-between">
    <button data-id="${alarm.id}" class="btn btn-danger deleteAlarm"><i class="fa fa-trash"></i></button>
    ${button}
    </div>
    </td> 
    <td>${typeStr}</td>
    <td>${alarm.ident}</td>
    <td>${alarm.lon}</td>
    <td>${alarm.lat}</td>
    <td>${alarm.network}</td>
    <td>${vars}</td>
    <td>${trange}</td>
    <td>${level}</td>
    </tr>`;

    let found = false;
    self.markers.forEach((marker1, index) => {
      if (marker1.data.lon === alarm.lon && marker1.data.lat === alarm.lat)
        found = index;
    });
    if (found === false) {
      let marker = L.marker([lat, lon]);
      marker.data = {};
      marker.data.ids = [];
      marker.data.lon = alarm.lon;
      marker.data.lat = alarm.lat;
      marker.data.ids.push(alarm.id);
      self.markers.push(marker);
      marker.bindPopup(
        `Ident: ${null2_(alarm.ident)}
      <br>Lon: ${alarm.lon / 100000}
      <br>Lat: ${alarm.lat / 100000}
      <br>Network: ${alarm.network}`
      );
      marker.addTo(self.map);
    } else {
      self.markers[found].data.ids.push(alarm.id);
    }
  });

  let innerTable = ` <div class="table-responsive" >
                      <table class="table table-sm table-bordered table-hover table-striped" id="tableAlarms">
                          <thead>
                          <tr>
                          <th></th>
                          <th>Status</th>
                              <th>Ident</th>
                              <th>Longitudine</th>
                              <th>Latitudine</th>
                              <th>Network</th>
                              <th>Var</th>
                              <th>Trange</th>
                              <th>level</th>
                          </tr>
                          </thead>
                          <tbody>
                              ${innerTrs}
                          </tbody>
                      </table>
                    </div>`;

  listSel.append(innerTable);
  if (coords.length > 0) {
    try {
      self.map.fitBounds(coords);
    } catch (err) {
      toastr.error("Error setting bounds...");
    }
  }
};
