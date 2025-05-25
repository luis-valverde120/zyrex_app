"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authRouter = (0, express_1.Router)();
// get routes
// ---- LOGIN ----
authRouter.get("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    res.render("login", {
        title: "Iniciar sesión",
        error: null
    });
});
// ---- REGISTRO ----
authRouter.get('/register', (req, res) => {
    // Si el usuario ya está logueado, quizás redirigirlo a la home
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', {
        titulo: 'Crear Cuenta',
        error: null,
        values: {} // Para repoblar el formulario en caso de error
    });
});
// post routes
authRouter.post("/login", authController_1.loginUser);
authRouter.post("/register", authController_1.registerUser);
authRouter.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login'); // Redirige a login
    });
});
exports.default = authRouter;
