let joi = require('@hapi/joi');
let _ = require('lodash');

function validate(schema, data) {
    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
}

function validateSchema(schema, from) {
    return (req, res, next) => {
        let validateError = {};

        if (from === 'response') {
            let { value, error } = validate(schema, req.responseData);
            if (error && !_.isEmpty(error)) {
                validateError.response = error;
            } else {
                req.responseData = value;
            }
        } else {
            let locations = _.keys(schema);
            locations.forEach(location => {
                if (schema[location] && joi.isSchema(schema[location])) {
                    let { value, error } = validate(schema[location], req[location]);
                    if (error && !_.isEmpty(error)) {
                        validateError[location] = error;
                    } else {
                        req[location] = value;
                    }
                }
            });
        }
        if (!_.isEmpty(validateError)) {
            return next({
                isSchemaError: true,
                error: validateError
            });
        } else {
            return next();
        }
    };
}

module.exports = validateSchema;