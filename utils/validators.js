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
    favorite: Joi.boolean()
});

const updateContact = Joi.object({
    name: Joi.string()
        .min(3).max(30),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: ["com", "pl", "net"] }),
    phone: Joi.string()
        .regex(/^\d{3}-\d{3}-\d{3}$/)
        .message({"string.pattern.base": `Phone number must be written as 777-777-777.`,
    }),
    favorite: Joi.boolean()
});

const signupAndLoginValidation = Joi.object({
    password: Joi.string()
        .min(8).required()
        .max(30).required()
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,30}$/)
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password must not be more than 30 characters",
            "string.pattern.base":
            "Password must contain at least one uppercase letter and one lowercase letter",
        }),
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address",
    }),
});

module.exports.signupAndLoginValidation = (req, res, next) => {
    const { error } = signupAndLoginValidation.validate(req.body);
    if (error) {
        const [{ message }] = error.details;
        return res.status(400).json({ message: message });
    }
    next();
};

module.exports.contactValidator = (req, res, next) => {
    const { error } = contactValidator.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "missing required fields" });
    }
    next();
};

module.exports.contactUpdateValidator = (req, res, next) => {
    const { error } = updateContact.validate(req.body);
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "missing fields" });
    }
    if (error) {
        const [{ message }] = error.details;
        return res.status(400).json({ message: message });
    }
    next();
};