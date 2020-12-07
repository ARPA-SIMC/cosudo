let SearchForm = function () {
  this.values = {
    ident: [],
    lon_lat: [],
    network: [],
    vars: [],
    timerange: [],
    level: [],
  };
  this.selectedValues = {
    ident: "*",
    lon_lat: "*",
    network: "*",
    hour: "*",
    vars: "*",
    timerange: "*",
    level: "*",
    dsn: "report_fixed",
  };
};

SearchForm.prototype.resetValues = function () {
  this.values = {
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
};

SearchForm.prototype.addValueArray = function (key, value) {
  this.values[key].push(value);
};

SearchForm.prototype.setValues = function (values) {
  this.values = values;
};

SearchForm.prototype.setSelectedValue = function (key, value) {
  this.selectedValues[key] = value;
};

SearchForm.prototype.getValues = function (key, value) {
  return this.values;
};

SearchForm.prototype.getSelectedValues = function (key, value) {
    return this.selectedValues;
  };
  

