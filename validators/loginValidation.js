const { body } = require("express-validator");
exports.loginValidation=[
    body("email").isEmail().normalizeEmail().withMessage("Invalid mail"),
    body("password").isStrongPassword().withMessage("weak and incorrect password")
]