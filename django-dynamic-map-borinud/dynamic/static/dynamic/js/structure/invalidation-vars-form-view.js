let InvalidationVarsFormView = function () {
    this.values = {"varsInvalidation": [], "trangeInvalidation": [], "levelInvalidation": []}
};

InvalidationVarsFormView.prototype.initEvents = function () {
    const self = this;

    function nilToNull(s) {
        if (s === "nil")
            return null
        return s
    }

    $.ajax({
        url: "/dynamic/get-all-vars-vm2",
        dataType: "json",
        success: function (collection) {
            collection.variables.forEach((vars) => {
                self.values.varsInvalidation.push(vars.bcode)
                self.values.trangeInvalidation.push([vars.tr, vars.p1, vars.p2] + "")
                self.values.levelInvalidation.push([null2_(nilToNull(vars.lt1)), null2_(nilToNull(vars.l1)), null2_(nilToNull(vars.lt2)), null2_(nilToNull(vars.l2))] + "")
            })
            let uniqueValues = {
                "varsInvalidation": [...new Set(self.values.varsInvalidation)],
                "trangeInvalidation": [...new Set(self.values.trangeInvalidation)],
                "levelInvalidation": [...new Set(self.values.levelInvalidation)]
            }
            console.log(uniqueValues)
            self.render(uniqueValues)
        }
    })
}
InvalidationVarsFormView.prototype.render = function (collection) {
    const self = this

    for (let key in collection) {
        let selectSel = $(`#${key}`)
        let html = ""
        selectSel.html("")
        collection[key].forEach((item) => {
            let described = item
            if (key === "trangeInvalidation") {
                let [t1, t2, t3, t4] = borinud.config.trange.decode(item);
                described = borinud.config.trange.describe(t1, t2, t3, t4);
            }
            if (key === "levelInvalidation") {
                let [l1, l2, l3, l4] = borinud.config.level.decode(item);
                described = borinud.config.level.describe(l1, l2, l3, l4);
            }
            if (key === "varsInvalidation") {
                if (borinud.config.B[item] !== undefined) {
                    described = borinud.config.B[item].description + " " + borinud.config.B[item].unit;
                }
            }
            html += `<option value="${item}">${described}</option>`
        })
        selectSel.html(html)
    }

}