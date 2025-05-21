const validator = require('validator');
const isEmpty = require('./isempty');

module.exports = function validateprofileinput(data) {
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';

    

    if (!validator.isLength(data.handle, { min: 2, max: 30 })) {
        errors.handle = "Handle need to  Between 2 and 30 Characters";
    }

    if (validator.isEmpty(data.handle)) {
        errors.handle = "Profile handle is Required";
    }

    if (validator.isEmpty(data.status)) {
        errors.status = "Status is Required";
    }

    if (validator.isEmpty(data.skills)) {
        errors.skills = "Skills is Required";
    }

    if (!isEmpty(data.website)) {
        if (!validator.isURL(data.website))
            errors.website = "websiteis Invalid";
    }
    if (!isEmpty(data.youtube)) {
        if (!validator.isURL(data.youtube))
            errors.youtube = "youtube is Invalid";
    }
    if (!isEmpty(data.twitter)) {
        if (!validator.isURL(data.twitter))
            errors.twitter = "twitter is Invalid";
    }
    if (!isEmpty(data.facebook)) {
        if (!validator.isURL(data.facebook))
            errors.facebook = "facebook is Invalid";
    }
    if (!isEmpty(data.linkedin)) {
        if (!validator.isURL(data.linkedin))
            errors.linkedin = "linkedin is Invalid";
    }
    if (!isEmpty(data.instagram)) {
        if (!validator.isURL(data.instagram))
            errors.instagram = "instagram is Required";
    }
    return {
        errors: errors,
        isvalid: isEmpty(errors)
    }
}

//help me