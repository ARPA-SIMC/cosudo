let SearchForm = function () {
    this.values = {
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
};
