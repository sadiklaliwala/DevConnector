const validator = require('validator');
const isEmpty = require('./isempty');

module.exports = function validateregisterinput(data) {
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if (!validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = "Name Must be Between 2 and 30 Characters";
    }

    if (validator.isEmpty(data.name)) {
        errors.name = "Name is Required";
    }

    if (!validator.isEmail(data.email)) {
        errors.email = "Email is Invalid ";
    }

    if (validator.isEmpty(data.email)) {
        errors.email = "Email is Required";
    }


    if (!validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = "password Must be Between 6 and 30 Characters";
    }

    if (validator.isEmpty(data.password)) {
        errors.password = "password is Required";
    }

    if (!validator.equals(data.password, data.password2)) {
        errors.password = " Password Must be Match";
    }

    if (validator.isEmpty(data.password2)) {
        errors.password2 = "Confirm Password is Required";
    }
    
    return {
        errors: errors,
        isvalid: isEmpty(errors)
    }
}