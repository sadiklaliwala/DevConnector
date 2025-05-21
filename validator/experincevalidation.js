const validator = require('validator');
const isEmpty = require('./isempty');

module.exports = function validateExperinceinput(data) {
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.from = !isEmpty(data.from) ? data.from : '';

    if (validator.isEmpty(data.title)) {
        errors.title = "Job Title Field is Required ";
    }

    if (validator.isEmpty(data.company)) {
        errors.company = "Job Company Field is Required ";
    }

    if (validator.isEmpty(data.from)) {
        errors.from = "From When You start Date Field is Required ";
    }
    
    return {
        errors: errors,
        isvalid: isEmpty(errors)
    }
}