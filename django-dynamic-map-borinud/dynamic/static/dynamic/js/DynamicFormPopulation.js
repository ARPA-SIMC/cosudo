class DynamicFormPopulation {
    constructor() {
        let today = new Date()
        let self = this
        this.selected_values = {
            ident: "*",
            lon_lat: "*",
            network: "*",
            date: "1999-01-01",
            hour: "*",
            vars: "*",
            timerange: "*",
            level: "*",
            dsn: "report_fixed",
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
            dsn: ["report_fixed", "sample_fixed"],
        };
        let id_select_list = ["ident", "lon_lat", "network", "date", "vars", "timerange", "level"];
        for (let id of id_select_list) {
            $("select[name=" + id + "]").on("change", function () {
                self.populateForm(this)
            })
        }

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
            //defaultDate: moment(this.selected_values.date, "YYYY/MM/DD"), //this.selected_values.date,
            locale: 'it'
        });


    }

    populateForm(e) {
        let id_select_list = ["ident", "lon_lat", "network", "date", "vars", "timerange", "level"];
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



