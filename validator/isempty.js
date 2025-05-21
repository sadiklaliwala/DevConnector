const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    if (typeof value === 'string' && value.trim().length === 0) return true;
    return false;
};

module.exports = isEmpty;