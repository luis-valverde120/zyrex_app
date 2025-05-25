"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
exports.registerUser = registerUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
// loginUser is a function that handles user login
async function loginUser(req, res, next) {
    const { email, password } = req.body;
    // validate the user data
    if (!email || !password) {
        res.status(400).json({
            message: "Email and password are required",
        });
        return;
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        // validate the user
        if (!user) {
            res.status(401).render("login", {
                title: "Iniciar sesión",
                error: "Invalid email or password",
            });
            return;
        }
        // validate the password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).render("login", {
                title: "Iniciar sesión",
                error: "Invalid email or password",
            });
            return;
        }
        // ---- INICIO DE SESIÓN EXITOSO ----
        req.session.user = {
            id: user.id,
            email: user.email,
            name: user.nombre,
            direccion: user.direccion,
            telefono: user.telefono,
            rol: user.rol,
        };
        req.session.save((err) => {
            if (err) {
                return next(err);
            }
            // redirect to the home page
            res.redirect("/");
        });
    }
    catch (error) {
        console.error("Error checking user:", error);
        // this is for unexpected errors
        res.status(500).json({
            message: "Internal server error",
        });
        return;
    }
}
;
// registerUser is a function that handles user registration
async function registerUser(req, res, next) {
    const { nombre, email, password, confirmPassword, direccion, telefono, esArtesano, } = req.body;
    const formsValues = {
        nombre,
        email,
        password,
        confirmPassword,
        telefono,
        direccion,
        esArtesano,
    };
    if (!nombre || !email || !password || !confirmPassword || !direccion || !telefono) {
        res.status(400).render("register", {
            title: "Crear Cuenta",
            error: "All fields are required",
            values: formsValues,
        });
        return;
    }
    // check if passowrd is equal to the confirm password
    if (password !== confirmPassword) {
        res.status(400).render("register", {
            title: "Crear Cuenta",
            error: "Passwords do not match",
            values: formsValues,
        });
        return;
    }
    if (password.length < 6) {
        res.status(400).render("register", {
            title: "Crear Cuenta",
            error: "Password must be at least 6 characters long",
            values: formsValues,
        });
        return;
    }
    try {
        const existUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existUser) {
            res.status(400).render("register", {
                title: "Crear Cuenta",
                error: "Email already exists",
                values: formsValues,
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // get role user
        const userRole = esArtesano ? "ARTESANO" : "CLIENTE";
        const newUser = await prisma_1.prisma.user.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
                direccion,
                telefono,
                rol: userRole,
            },
        });
        console.log("User created:", newUser);
        // ---- REGISTRO EXITOSO ----
        res.redirect("/login");
    }
    catch (error) {
        console.error("Error checking user:", error);
        // this is for unexpected errors
        res.status(500).json({
            message: "Internal server error",
        });
        return;
    }
}
;
