$(function () {
    const dateTimePickerSel = $('#datetimepicker')
    const overlay = $("#overlay")
    dateTimePickerSel.datetimepicker({
        widgetPositioning: {
            horizontal: 'left',
            vertical: 'bottom'
        },
        format: 'L',
        //defaultDate: moment(this.selected_values.date, "YYYY/MM/DD"), //this.selected_values.date,
        locale: 'it'
    });

    $.ajax({
        url: "{{ url_borinud }}/jsonline/*/*/*/*/*/*/summaries",
        dataType: "text",
        success: function (resp) {
            let initialSearchForm = new SearchForm()
            resp = (JSON.parse("{\"j\":[" + resp.replace(/}\n{/g, "}, {") + "]}")).j;
            for (var r of resp) {
                initialSearchForm.ident.push(r.ident + "");
                initialSearchForm.lon_lat.push(r.lon + "," + r.lat);
                initialSearchForm.network.push(r.network + "");
                initialSearchForm.date.push(r.date[0].substring(0, 10) + "")
                let d = r.data[0];
                initialSearchForm.vars.push(Object.keys(d.vars)[0] + "");
                initialSearchForm.timerange.push(d.timerange + "");
                let level = d.level.map((level) =>
                    level == null ? "-" : level
                )
                initialSearchForm.level.push(level + "");
                const searchFormView = new SearchFormView(SearchForm, initialSearchForm)
                searchFormView.initEvents()
            }
            //dynamicFormPopulation.populateForm(undefined);
            //let enabledDates = Object.keys($('#datetimepicker').datetimepicker('enabledDates')).sort((a, b) => new Date(b) - new Date(a))
            //let lastDate = enabledDates[0]
            // $('#datetimepicker').datetimepicker('date', new Date(lastDate))

        },
        beforeSend: function () {
            overlay.fadeIn(300);
        },
        complete: function () {
            overlay.fadeOut(300);
        },
        error: function (e) {
            toastr.error("Borinud not available!")
            console.log(e.toString());
        }
    });
});