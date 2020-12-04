let SearchFormView = function (searchForm, urlBorinud, overlay) {
    this.selectedDate = new Date();
    this.searchForm = searchForm;
    this.urlBorinud = urlBorinud;
    this.overlay = overlay;
  };
  
  SearchFormView.prototype.initEvents = function () {
    const self = this;
  
    $("#datetimepicker").datetimepicker({
      widgetPositioning: {
        horizontal: "left",
        vertical: "bottom",
      },
      format: "YYYY-MM-DD",
      defaultDate: moment(self.selectedDate).format("YYYY-MM-DD"), //this.selected_values.date,
      locale: "it",
    });
  
    self.publishers();
    self.subscribers();
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
            date: [],
            hour: [
              "*",
              "00",
              "01",
              "02",
              "03",
              "04",
              "05",
              "06",
              "07",
              "08",
              "09",
              "10",
              "11",
              "12",
              "13",
              "14",
              "15",
              "16",
              "17",
              "18",
              "19",
              "20",
              "21",
              "22",
              "23",
            ],
            vars: [],
            timerange: [],
            level: [],
            dsn: ["report_fixed", "sample_fixed"],
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
          $.Topic("set-values-search-form").publish(values);
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
  
    $("#moreTime").on("click", function () {
      let date = moment($("#datetimepicker").datetimepicker("viewDate")).add(
        +1,
        "days"
      );
  
      $("#datetimepicker").datetimepicker("date", date);
    });
  
    $("#lessTime").on("click", function () {
      let date = moment($("#datetimepicker").datetimepicker("viewDate")).add(
        -1,
        "days"
      );
  
      $("#datetimepicker").datetimepicker("date", date);
    });
  
    $("#datetimepicker").on("change.datetimepicker", function (e) {
      e.stopPropagation();
      let newDate = e.date;
      getSummary(newDate);
    });
  
    $(".search-form").on("change", function (e) {
      self.filterValues(e);
    });
  
    $("#moreHour").on("click", function () {
      let hourSel = $("#hour");
      let length = $("#hour > option").length;
      if (hourSel[0].selectedIndex + 1 < length) hourSel[0].selectedIndex += 1;
      else hourSel[0].selectedIndex = 0;
      hourSel.change();
    });
  
    $("#lessHour").on("click", function () {
      let hourSel = $("#hour");
      let length = $("#hour > option").length;
      if (hourSel[0].selectedIndex - 1 >= 0) hourSel[0].selectedIndex -= 1;
      else hourSel[0].selectedIndex = length - 1;
      hourSel.change();
    });
  
    $('select[name="vars"]').on("change", function () {
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
  
  SearchFormView.prototype.subscribers = function () {
    const self = this;
  
    $.Topic("set-values-search-form").subscribe(function () {
      self.filterValues();
    });
  };
  SearchFormView.prototype.filterValues = function (e) {
    const self = this;
    let select_values_lists = self.searchForm.getValues();
    let filteredValues = {
      ident: [],
      lon_lat: [],
      network: [],
      date: [],
      hour: [
        "*",
        "00",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
      ],
      vars: [],
      timerange: [],
      level: [],
      dsn: ["report_fixed", "sample_fixed"],
    };
    $(".search-form").each((index, select) => {
      let firstId = select.id;
      let index_list = [...Array(select_values_lists[firstId].length).keys()];
      $(".search-form").each((index2, select2) => {
        let secondId = select2.id;
        if (secondId !== firstId) {
          let selectedValue = $(select2).val();
          if (selectedValue !== "*") {
            let temp_index_list = [];
            for (let i of index_list) {
              if (select_values_lists[secondId][i] === selectedValue) {
                temp_index_list.push(i);
              }
            }
            index_list = temp_index_list;
          }
        }
      });
      let newValues = index_list.map(
        (index) => select_values_lists[firstId][index]
      );
      newValues = [...new Set(newValues)];
      filteredValues[firstId] = newValues;
    });
    let eId = e ? e.target.id : "";
    self.render(filteredValues, eId);
  };
  
  SearchFormView.prototype.render = function (filteredValues, eId) {
    const self = this;
  
    $(".search-form").each((index, select) => {
      let id = select.id;
      let selectedValue = $(select).val();
      selectedValue = selectedValue === undefined ? "*" : selectedValue;
      if (id !== eId || selectedValue === "*") {
        $(select).find("option").remove();
        $(select).append(`<option value="*">*</option>`);
        if (selectedValue === "*")
          $(select).find("option[value='*']").prop("selected", "selected");
  
        filteredValues[id].forEach((value) => {
          let description = value;
          if (id === "vars") {
            if (borinud.config.B[value] !== undefined) {
              description =
                borinud.config.B[description].description +
                " " +
                borinud.config.B[description].unit;
            }
          } else if (id === "level") {
            let [l1, l2, l3, l4] = borinud.config.level.decode(description);
            description = borinud.config.level.describe(l1, l2, l3, l4);
          } else if (id === "timerange") {
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
    });
  };
  