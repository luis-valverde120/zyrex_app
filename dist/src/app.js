"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const app = (0, express_1.default)();
// views configuration ejs
app.set("view engine", "ejs");
app.set('views', path_1.default.join(__dirname, '..', 'views'));
// cors 
app.use((0, cors_1.default)());
// middlewares
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// ---- CONFIGURACIÓN DE SESIONES ----
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambia a true si usas HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 día
    }
}));
// Middleware para hacer disponible 'req.session.user' en todas las vistas EJS como 'locals.user'
app.use((req, res, next) => {
    res.locals.user = req.session.user; // 'user' contendrá la info del usuario logueado
    next();
});
// ---- SERVIR ARCHIVOS ESTÁTICOS ----
// Le decimos a Express que sirva cualquier archivo solicitado desde la carpeta 'public'
// (que está en la raíz del proyecto)
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});
// homepage route
app.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1; // Obtener el número de página desde la query, por defecto 1
        const limit = parseInt(req.query.limit) || 8; // Obtener el límite de productos por página, por defecto 10
        const skip = (page - 1) * limit; // Calcular el número de productos a saltar
        const whereCondition = {
            stock: {
                gt: 0 // Solo productos con stock mayor a 0
            }
        };
        if (!prisma) {
            throw new Error("Prisma client is not initialized.");
        }
        const [products, totalCount] = await prisma.$transaction([
            prisma.producto.findMany({
                where: whereCondition,
                skip: skip,
                take: limit,
                orderBy: {
                    nombre: 'asc' // Ordenar por nombre ascendente
                },
                include: { categoria: true } // Incluir la categoría del producto
            }),
            prisma.producto.count({ where: whereCondition }) // Contar el total de productos que cumplen la condición
        ]);
        const totalPages = Math.ceil(totalCount / limit); // Calcular el número total de páginas
        res.render('index', {
            titulo: 'Inicio',
            productos: products,
            currentPage: page,
            totalPages,
            limit,
            totalCount,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        next(error);
    }
});
// about page route
app.get('/about', (req, res) => {
    res.render('about', {
        titulo: 'Sobre Nosotros - Zyrex',
        // 'user' ya está disponible globalmente via res.locals.user si está configurado
    });
});
app.use(routes_1.authRouter);
app.use(routes_1.artisanRouter);
app.use("/products", routes_1.productRouter);
app.use("/cart", cartRoutes_1.default);
app.use(routes_1.catalogoRouter);
app.use('/checkout', routes_1.checkoutRouter);
app.use('/orders', routes_1.orderRouter);
// ---- MANEJO DE RUTAS NO ENCONTRADAS (404) ----
app.use((req, res, next) => {
    // Si es API, responde JSON, si no, renderiza vista 404.ejs
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ message: 'Endpoint de API no encontrado' });
    }
    else {
        res.status(404).render('404', {
            titulo: 'Página no Encontrada',
            user: req.user // O null
        });
    }
});
exports.default = app;
