const validator = require('validator');
const isEmpty = require('./isempty');

module.exports = function validateLogininput(data) {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (!validator.isEmail(data.email)) {
        errors.email = "Email is Invalid ";
    }

    if (validator.isEmpty(data.email)) {
        errors.email = "Email is Required";
    }

    

    if (validator.isEmpty(data.password)) {
        errors.password = "password is Required";
    }
    
    return {
        errors: errors,
        isvalid: isEmpty(errors)
    }
}