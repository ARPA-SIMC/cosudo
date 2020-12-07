let SearchFormView = function (searchForm, urlBorinud, overlay,classId, formFieldClassUpdate) {
  this.selectedDate = new Date();
  this.searchForm = searchForm;
  this.urlBorinud = urlBorinud;
  this.overlay = overlay;
  this.classId = classId;
  this.formFieldClassUpdate = formFieldClassUpdate;
};

SearchFormView.prototype.initEvents = function () {
  const self = this;

  $(`#datetimepicker${self.classId}`).datetimepicker({
    widgetPositioning: {
      horizontal: "left",
      vertical: "bottom",
    },
    format: "YYYY-MM-DD",
    defaultDate: moment(self.selectedDate).format("YYYY-MM-DD"), //this.selected_values.date,
    locale: "it",
  });

  self.publishers();
};

SearchFormView.prototype.publishers = function () {
  const self = this;

  getSummary(new Date());

  function getSummary(date) {
    date = moment(date).format("YYYY/MM/DD");
    $.ajax({
      url: `${self.urlBorinud}/dbajson/*/*/*/*/*/*/summaries/${date}`,
      dataType: "json",
      success: function (resp) {
        let values = {
          ident: [],
          lon_lat: [],
          network: [],
          vars: [],
          timerange: [],
          level: [],
        };
        resp.forEach((r) => {
          values.ident.push(r.ident === null ? "-" : r.ident + "");
          values.lon_lat.push(r.lon + "," + r.lat);
          values.network.push(r.network + "");
          //values.date.push(r.date[0].substring(0, 10) + "");
          let d = r.data[0];
          values.vars.push(Object.keys(d.vars)[0] + "");
          values.timerange.push(d.timerange + "");
          let level = d.level.map((level) => (level === null ? "-" : level));
          values.level.push(level + "");
        });
        //self.searchForm.setValues = values
        self.searchForm.setValues(values);
        self.filterValues();
      },
      beforeSend: function () {
        self.overlay.fadeIn(300);
      },
      complete: function () {
        self.overlay.fadeOut(300);
      },
      error: function (e) {
        toastr.error("Borinud not available!");
        console.log(e.toString());
      },
    });
  }

  $(`#moreTime${self.classId}`).on("click", function () {
    let date = moment($(`#datetimepicker${self.classId}`).datetimepicker("viewDate")).add(
      +1,
      "days"
    );

    $(`#datetimepicker${self.classId}`).datetimepicker("date", date);
  });

  $(`#lessTime${self.classId}`).on("click", function () {
    let date = moment($(`#datetimepicker${self.classId}`).datetimepicker("viewDate")).add(
      -1,
      "days"
    );

    $(`#datetimepicker${self.classId}`).datetimepicker("date", date);
  });

  $(`#datetimepicker${self.classId}`).on("change.datetimepicker", function (e) {
    e.stopPropagation();
    let newDate = e.date;
    getSummary(newDate);
  });

  $(`.${self.formFieldClassUpdate}`).on("change", function (e) {
    self.filterValues(e);
  });

  $(`#moreHour${self.classId}`).on("click", function () {
    let hourSel = $(`#hour${self.classId}`);
    let length = $(`#hour${self.classId} > option`).length;
    if (hourSel[0].selectedIndex + 1 < length) hourSel[0].selectedIndex += 1;
    else hourSel[0].selectedIndex = 0;
    hourSel.change();
  });

  $(`#lessHour${self.classId}`).on("click", function () {
    let hourSel = $(`#hour${self.classId}`);
    let length = $(`#hour${self.classId} > option`).length;
    if (hourSel[0].selectedIndex - 1 >= 0) hourSel[0].selectedIndex -= 1;
    else hourSel[0].selectedIndex = length - 1;
    hourSel.change();
  });

  $(`select[name="varsGraph"]`).on("change", function () {
    if (this.value === "B11001" || this.value === "B11002") {
      $("#showWindRose").show();
    } else {
      $("#showWindRose").hide();
    }
  });

  $("input[name='objectToShow']").on("change", function () {
    if ($("input[name='objectToShow']:checked").val() === "data") {
      $(".to-disable").prop("disabled", false);
    } else {
      $(".to-disable").prop("disabled", true);
    }
  });
};

SearchFormView.prototype.filterValues = function (e) {
  const self = this;
  let select_values_lists = self.searchForm.getValues();
  let filteredValues = {
    ident: [],
    lon_lat: [],
    network: [],
    vars: [],
    timerange: [],
    level: [],
  };
  let keys = Object.keys(select_values_lists);

  keys.forEach((key) => {
    let index_list = [...Array(select_values_lists[key].length).keys()];
    keys.forEach((key2) => {
      let secondId = `${key2}${self.classId}`;
      if (key !== key2) {
        let selectedValue = $(`#${secondId}`).val();
        if (selectedValue !== "*") {
          let temp_index_list = [];
          for (let i of index_list) {
            if (select_values_lists[key2][i] === selectedValue) {
              temp_index_list.push(i);
            }
          }
          index_list = temp_index_list;
        }
      }
    });
    let newValues = index_list.map((index) => select_values_lists[key][index]);
    newValues = [...new Set(newValues)];
    filteredValues[key] = newValues;
  });
  let eId = e ? e.target.id : "";
  self.render(filteredValues, eId);
};

SearchFormView.prototype.render = function (filteredValues, eId) {
  const self = this;
  let keys = Object.keys(filteredValues)
  keys.forEach((key)=>{
      let id = `${key}${self.classId}`;
      let select = $(`#${id}`)
      let selectedValue = select.val();
      selectedValue = selectedValue === undefined ? "*" : selectedValue;
      if (id !== eId || selectedValue === "*") {
        $(select).find("option").remove();
        $(select).append(`<option value="*">*</option>`);
        if (selectedValue === "*")
          $(select).find("option[value='*']").prop("selected", "selected");
  
        filteredValues[key].forEach((value) => {
          let description = value;
          if (key === "vars") {
            if (borinud.config.B[value] !== undefined) {
              description =
                borinud.config.B[description].description +
                " " +
                borinud.config.B[description].unit;
            }
          } else if (key === "level") {
            let [l1, l2, l3, l4] = borinud.config.level.decode(description);
            description = borinud.config.level.describe(l1, l2, l3, l4);
          } else if (key === "timerange") {
            let [t1, t2, t3, t4] = borinud.config.trange.decode(description);
            description = borinud.config.trange.describe(t1, t2, t3, t4);
          }
          $(select).append(
            `<option value="${value}" ${
              value === selectedValue ? "selected" : ""
            }>${description}</option>`
          );
        });
      }
  })
 
};
