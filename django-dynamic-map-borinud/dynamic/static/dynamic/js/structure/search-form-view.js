let SearchFormView = function (SearchForm, initialSearchForm) {
    this.searchForm = initialSearchForm;
    this.SearchForm = SearchForm
};

SearchFormView.prototype.initEvents = function () {
    const self = this;
    const values = self.searchForm.values
    const filteredValues = new this.SearchForm().values
    const dateTimePickerSel = $('#datetimepicker')
    let enabledDates = values["date"].map((item) => moment(item, "YYYY/MM/DD")).sort(function (a, b) {
        return new Date(b) - new Date(a);
    })
    dateTimePickerSel.datetimepicker({
        widgetPositioning: {
            horizontal: 'left',
            vertical: 'bottom'
        },
        enabledDates: enabledDates,
        format: 'YYYY-MM-DD',
        defaultDate: enabledDates[0], //this.selected_values.date,
        locale: 'it'
    });
    populateForm(undefined)

    dateTimePickerSel.on('change.datetimepicker', function (e) {
        e.stopPropagation()
        populateForm(undefined)
    });

    function populateForm(e) {
        let date = moment(dateTimePickerSel.datetimepicker("viewDate")).format("YYYY-MM-DD")
        let index_list = []
        values["date"].forEach((item, index) => {
            if (date === item) {
                index_list.push(index)
            }
        })
        $(".search-form").each((index, select) => {
            let firstId = select.id
            $(".search-form").each((index2, select2) => {
                let secondId = select2.id
                if (secondId !== firstId) {
                    let selectedValue = $(select2).val()
                    if (selectedValue !== "*") {
                        let temp_index_list = []
                        for (let i of index_list) {
                            if (values[secondId][i] === selectedValue) {
                                temp_index_list.push(i);
                            }
                        }
                        index_list = temp_index_list;
                    }
                }
            })
            let newValues = index_list.map((index) => values[firstId][index]);
            newValues = [...new Set(newValues)]
            filteredValues[firstId] = newValues

        })
        let eId = e ? e.target.id : ""
        self.render(filteredValues, eId)
    }


    $(".search-form").on("change", function (e) {
        populateForm(e)
    })
    $("#moreTime").on("click", function () {
        let date = moment(dateTimePickerSel.datetimepicker("viewDate")).format("YYYY-MM-DD")
        let enabledDates = Object.keys(dateTimePickerSel.datetimepicker("enabledDates"))
        let length = enabledDates.length
        let index = enabledDates.indexOf(date)
        if (index + 1 < length)
            index += 1
        else
            index = 0
        dateTimePickerSel.datetimepicker("date", moment(enabledDates[index], "YYYY-MM-DD"))
    })
    $("#lessTime").on("click", function () {
        let date = moment(dateTimePickerSel.datetimepicker("viewDate")).format("YYYY-MM-DD")
        let enabledDates = Object.keys(dateTimePickerSel.datetimepicker("enabledDates"))
        let length = enabledDates.length
        let index = enabledDates.indexOf(date)
        if (index - 1 >= 0)
            index -= 1
        else
            index = length - 1
        dateTimePickerSel.datetimepicker("date", moment(enabledDates[index], "YYYY-MM-DD"))

    })
    $("#moreHour").on("click", function () {
        let hourSel = $("#hour")
        let length = $("#hour > option").length
        if (hourSel[0].selectedIndex + 1 < length)
            hourSel[0].selectedIndex += 1
        else
            hourSel[0].selectedIndex = 0
        hourSel.change()
    })

    $("#lessHour").on("click", function () {
        let hourSel = $("#hour")
        let length = $("#hour > option").length
        if (hourSel[0].selectedIndex - 1 >= 0)
            hourSel[0].selectedIndex -= 1
        else
            hourSel[0].selectedIndex = length - 1
        hourSel.change()
    })

    $('select[name="vars"]').on("change", function () {
        if (this.value === "B11001" || this.value === "B11002") {
            $("#showWindRose").show();
        } else {
            $("#showWindRose").hide();
        }
    })

    $("input[name='objectToShow']").on("change", function () {
        if ($("input[name='objectToShow']:checked").val() === "data") {
            $(".to-disable").prop("disabled", false);
        } else {
            $(".to-disable").prop("disabled", true);
        }
    })

}
SearchFormView.prototype.render = function (filteredValues, eId) {
    console.log(filteredValues)
    const self = this
    $(".search-form").each((index, select) => {
        let id = select.id
        let selectedValue = $(select).val()
        selectedValue = selectedValue === undefined ? "*" : selectedValue
        console.log(id, eId)
        if (id !== eId || selectedValue ==="*") {
            $(select).find('option').remove()
            $(select).append(`<option value="*">*</option>`)
            if (selectedValue === "*")
                $(select).find("option[value='*']").prop("selected", "selected")

            filteredValues[id].forEach((value) => {
                let description = value
                if (id === "vars") {
                    if (borinud.config.B[value] !== undefined) {
                        description = borinud.config.B[description].description + " " + borinud.config.B[description].unit;
                    }
                } else if (id === "level") {
                    let [l1, l2, l3, l4] = borinud.config.level.decode(description);
                    description = borinud.config.level.describe(l1, l2, l3, l4);
                } else if (id === "timerange") {
                    let [t1, t2, t3, t4] = borinud.config.trange.decode(description);
                    description = borinud.config.trange.describe(t1, t2, t3, t4);
                }
                $(select).append(`<option value="${value}" ${value === selectedValue ? "selected" : ""}>${description}</option>`);
            })
        }

    })
}