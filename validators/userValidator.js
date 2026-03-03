const { body } = require("express-validator");
//do validator use kiye hain - validator , second one- express validator

exports.signupValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("First name must be 3+ chars"),

  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),

  body("password").isStrongPassword().withMessage("Weak password"),

  body("age")
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage("age must be betweeb 18-100"),
];