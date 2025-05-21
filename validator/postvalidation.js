const validator = require('validator');
const isEmpty = require('./isempty');

module.exports = function validatePostinput(data) {
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';

    if (!validator.isLength(data.text, { min: 10, max: 300 })) {
        errors.text = "Handle need to  Between 10 and 30 Characters";
    }

    if (validator.isEmpty(data.text)) {
        errors.text = "Text field is Required";
    }

    return {
        errors: errors,
        isvalid: isEmpty(errors)
    }
}

//help me