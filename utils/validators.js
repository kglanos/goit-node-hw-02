const Joi = require('joi');

const contactValidator = Joi.object({
    name: Joi.string()
        .min(3).max(30).required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: ["com", "pl", "net"] }).required(),
    phone: Joi.string()
        .regex(/^\d{3}-\d{3}-\d{3}$/)
        .message({"string.pattern.base": `Phone number must be written as 777-777-777.`,
    })
    .required(),
});

const updateContact = Joi.object({
    name: Joi.string()
        .min(3).max(30),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: ["com", "pl", "net"] }),
    phone: Joi.string()
        .regex(/^\d{3}-\d{3}-\d{3}$/)
        .message({"string.pattern.base": `Phone number must be written as 777-777-777.`,
    })
});

const validate = (schema, body, next) => {
    const { error } = schema.validate(body);
    if (error) {
        const [{ message }] = error.details;
        return next({
            status: 400,
            message: `Field: ${message.replace(/"/g, '')}`
        });
    }
    next();
};

module.exports.contactValidator = (req, res, next) => {
    return validate(contactValidator, req.body, next);
};

module.exports.contactUpdateValidator = (req, res, next) => {
    return validate(updateContact, req.body, next);
};