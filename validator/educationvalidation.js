const validator = require('validator');
const isEmpty = require('./isempty');

module.exports = function validateEducationinput(data) {
    let errors = {};

    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstydy = !isEmpty(data.fieldofstydy) ? data.fieldofstydy : '';
    data.from = !isEmpty(data.from) ? data.from : '';

    if (validator.isEmpty(data.school)) {
        errors.school = "School Field is Required ";
    }

    if (validator.isEmpty(data.degree)) {
        errors.degree = "degree Field is Required ";
    }

    if (validator.isEmpty(data.fieldofstydy)) {
        errors.fieldofstydy = "which type of Field is Required ";
    }

    if (validator.isEmpty(data.from)) {
        errors.from = "From When You start Date Field is Required ";
    }

    return {
        errors: errors,
        isvalid: isEmpty(errors)
    }
}