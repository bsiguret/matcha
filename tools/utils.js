module.exports = {
    //Vérifie qu'un objet est vide
    isEmpty : (obj) => {
        for (var key in obj) {
            return obj.hasOwnProperty(key) ? false : true 
        }
        return true;
    },
    //Vérifie qu'une propriété/clé d'un objet soit vide
    isPropEmpty : (props) => {
        if (props && props !== null && props !== '') {
            return false;
        }
        return true;
    },
    //Vérifie qu'une liste de propriété/clé d'un object soit vide
    isObjPropsEmpty : (objProps) => {
        let empty = false
        for (var key in objProps) {
            if (!module.exports.isPropEmpty(objProps[key])) {
                empty = true;
            }
        }
        return empty;
    },
    //Retourne une liste de propriété non null/vide d'un objet
    keepPropsFulfilled : (obj) => {
        let fulfilled = {};
        for (var key in obj) {
            if (!module.exports.isPropEmpty(obj[key])) {
                fulfilled[key] = obj[key]
            }
        }
        return fulfilled
    },

    canUp : (obj) => {
        let err = {}
        let ret = false
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (!obj[property]) {
                    err[property] = "Cannot be empty !"
                    ret = true
                }
            }
        }
        return ret ? err : ret
    },

    isValidAge : (age) => {
        if (age >= 18 && age <= 80) {
            return true
        }
        return false
    },

    ageToDate : (age) => {
        var today = new Date().toLocaleDateString();
        var todaySplit = today.split('/')
        var ageToDate = parseInt(todaySplit[2] - age)
        ageToDate = ageToDate.toString() + '-' + todaySplit[1] + '-' + todaySplit[0]
        return ageToDate
    },

    dateToAge : (date) => {
        var today = new Date().toLocaleDateString();
        var todaySplit = today.split('/')
        var currentDate = date.split('-')
        var dateToAge = parseInt(todaySplit[2] - currentDate[2])
        return dateToAge
    },

    dateBirthtoYYYYMMDD : (date) => {
        var dateLocal = date.split('/')
        dateLocal = dateLocal[2] + dateLocal[1] + dateLocal[0]
        return dateLocal.toString()
    }
}
