"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdmin = exports.ensureArtisan = exports.ensureAuthenticated = void 0;
const client_1 = require("@prisma/client");
/**
 * Middleware para asegurar que el usuario esta autenticado.
 * Si no lo redirigue a login
 *  */
const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect("/login");
};
exports.ensureAuthenticated = ensureAuthenticated;
/**
 * Middleware para asegurar que el usuario es un artesano.
 */
const ensureArtisan = (req, res, next) => {
    // Verifica si el usuario está autenticado
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    // verrificacion del rol
    if (req.session.user.rol === client_1.Role.ARTESANO) {
        return next();
    }
    res.status(403).render("error", {
        title: "Acceso Denegado",
        message: "No tienes permiso para acceder a esta página.",
        user: req.session.user // Pasar el usuario a la vista
    });
};
exports.ensureArtisan = ensureArtisan;
/**
 * Middleware para asegurar que el usuario es un administrador.
 */
const ensureAdmin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    // verrificacion del rol
    if (req.session.user.rol === client_1.Role.ADMIN) {
        return next();
    }
    res.status(403).render("error", {
        title: "Acceso Denegado",
        message: "No tienes permiso para acceder a esta página.",
        user: req.session.user // Pasar el usuario a la vista
    });
};
exports.ensureAdmin = ensureAdmin;
