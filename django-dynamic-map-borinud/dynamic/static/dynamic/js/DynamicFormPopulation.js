class DynamicFormPopulation {
    constructor() {
        let today = new Date()
        let self = this
        this.selected_values = {
            ident: "*",
            lon_lat: "*",
            network: "*",
            date: today.getFullYear() + "-" +
                ((today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : '' + (today.getMonth() + 1)) + "-" +
                ((today.getDate() < 10) ? '0' + (today.getDate()) : '' + (today.getDate())),
            hour: "*",
            vars: "*",
            timerange: "*",
            level: "*",
            dsn: "report"
        };
        this.select_values_lists = {
            ident: [],
            lon_lat: [],
            network: [],
            date: [],
            hour: ["*", "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15",
                "16", "17", "18", "19", "20", "21", "22", "23"],
            vars: [],
            timerange: [],
            level: [],
            dsn: ["report", "sample"],
            hours: []
        };
        let id_select_list = ["ident", "lon_lat", "network", "date", "vars", "timerange", "level", "hours"];
        for (let id of id_select_list) {
            $("select[name=" + id + "]").on("change", function () {
                self.populateForm(this)
            })
        }
        $("#sliderTime").slider({
            value: 0,
            min: 0,
            max: 1,
            slide: function (event, ui) {
                $("select[name='hours']")[0].selectedIndex = ui.value
            },
            step: 1,
        })
        $("select[name='dsn']").on("change", function () {
            if (this && this.id === "dsn") {
                self.selected_values["dsn"] = this.value;
            }
        })
        $("select[name='hour']").on("change", function () {
            if (this && this.id === "hour") {
                self.selected_values["hour"] = this.value;
            }
            // $("#sliderTime").slider("value", this.selectedIndex);
        })
        $('#datetimepicker').datetimepicker({
            widgetPositioning: {
                horizontal: 'left',
                vertical: 'bottom'
            },
            format: 'L',
            defaultDate: moment(this.selected_values.date, "YYYY/MM/DD"), //this.selected_values.date,
            locale: 'it'
        });
        $('#datetimepicker').on('change.datetimepicker datetimepicker.change', function (e) {
            // set on hidden field the selected date  and call function that update all filed using onchenge vent
            let selected_date = e.date.toDate();
            selected_date = selected_date.getFullYear() + "-" +
                ((selected_date.getMonth() + 1 < 10) ? '0' + (selected_date.getMonth() + 1) : '' + (selected_date.getMonth() + 1)) + "-" +
                ((selected_date.getDate() < 10) ? '0' + (selected_date.getDate()) : '' + (selected_date.getDate()))
            let select = document.getElementById("date");
            let opt = document.createElement('option');
            opt.value = selected_date;
            opt.innerHTML = selected_date;
            opt.selected = true;
            select.appendChild(opt);
            select.dispatchEvent(new Event('change'));
        });
        $("#moreTime").on("click", function () {
            let date = $('#datetimepicker').datetimepicker('viewDate')
            $('#datetimepicker').datetimepicker('date', date.add(1, 'days'))
        })
        $("#lessTime").on("click", function () {
            let date = $('#datetimepicker').datetimepicker('viewDate')
            $('#datetimepicker').datetimepicker('date', date.add(-1, 'days'))
        })
    }

    populateForm(e) {
        let id_select_list = ["ident", "lon_lat", "network", "date", "vars", "timerange", "level", "hours"];
        for (let id of id_select_list) {
            if (e && e.id === id) {
                this.selected_values[id] = document.getElementById(id).selectedOptions[0].value;
            } else {
                let index_list = [...Array(this.select_values_lists[id].length).keys()];
                for (let id2 of id_select_list) {
                    if (id !== id2) {
                        let target = document.getElementById(id2).selectedOptions[0].value;
                        if (target !== "*") {
                            let temp_index_list = [];
                            for (let i of index_list) {
                                if (this.select_values_lists[id2][i] === target) {
                                    temp_index_list.push(i);
                                }
                            }
                            index_list = temp_index_list;
                        }
                    }
                }
                let values = [];
                for (let i of index_list) {
                    values.push(this.select_values_lists[id][i]);
                }
                let unique = [...new Set(values)];
                let select = document.getElementById(id);
                //clear select option
                for (i = select.options.length - 1; i >= 0; i--) {
                    select.options[i] = null;
                }
                //create  wildcard option
                let opt = document.createElement('option');
                opt.value = "*";
                opt.innerHTML = "*";
                if (this.selected_values[id] === "*") {
                    opt.selected = true;
                }
                select.appendChild(opt);

                //append distinct option to select
              //  console.log(unique)
                if (id === "hours") {
                    unique.sort(function (a, b) {
                        return new Date(a) - new Date(b);
                    });
                    let sliderLabels = ["*", ...unique].map((item) => {
                        if (item !== "*")
                            return moment(item).format("HH:mm:ss")
                        return item
                    })
                    $("#sliderTime").slider("option", "max", sliderLabels.length - 1).slider('pips', {
                        first: 'label',
                        last: 'label',
                        rest: 'pip',
                        labels: sliderLabels,
                        step: 1,
                        prefix: "",
                        suffix: ""
                    }).slider('float', {
                        handle: true,
                        pips: true,
                        labels: sliderLabels,
                        prefix: "",
                        suffix: ""
                    }).slider("value",0);


                }
                for (var i = 0; i < unique.length; i++) {
                    let opt = document.createElement('option');
                    opt.value = unique[i];
                    let unique_html = unique[i];
                    //Use borinud config file to translate code in verbose text
                    if (id === "vars") {
                        if (borinud.config.B[unique_html] !== undefined) {
                            unique_html = borinud.config.B[unique_html].description + " " + borinud.config.B[unique_html].unit;
                        }
                    } else if (id === "level") {
                        let [l1, l2, l3, l4] = borinud.config.level.decode(unique_html);
                        unique_html = borinud.config.level.describe(l1, l2, l3, l4);
                    } else if (id === "timerange") {
                        let [t1, t2, t3, t4] = borinud.config.trange.decode(unique_html);
                        unique_html = borinud.config.trange.describe(t1, t2, t3, t4);
                    }
                    opt.innerHTML = unique_html;
                    if (this.selected_values[id] === unique[i]) {
                        opt.selected = true;
                    }
                    select.appendChild(opt);
                }

            }
        }

        // update only calendar filed

        let select = document.getElementById("date");
        let options = [];
        for (let i = 0, len = select.options.length; i < len; i++) {
            if (select.options[i].value !== "*") {
                options.push(moment(select.options[i].value, "YYYY-MM-DD"));
            }
        }
        //console.log(options)
        $('#datetimepicker').datetimepicker('enabledDates', options)
        //select hour and dsn
        select = document.getElementById("hour");
        select.value = this.selected_values["hour"];
        select = document.getElementById("dsn");
        select.value = this.selected_values["dsn"];

    }


}



