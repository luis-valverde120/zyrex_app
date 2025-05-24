import path from "path";
import express, { CookieOptions, Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import { authRouter, artisanRouter, productRouter } from "./routes";

// Extiende la interfaz SessionData para incluir 'user'
declare module "express-session" {
  interface SessionData {
    user?: any;
  }
}

const app: Express = express();

// views configuration ejs
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '..', 'views'));


// cors 
app.use(cors());

// middlewares
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ---- CONFIGURACIÓN DE SESIONES ----
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Cambia a true si usas HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 1 día
  }
}));

// Middleware para hacer disponible 'req.session.user' en todas las vistas EJS como 'locals.user'
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.user = req.session.user; // 'user' contendrá la info del usuario logueado
  next();
});

// ---- SERVIR ARCHIVOS ESTÁTICOS ----
// Le decimos a Express que sirva cualquier archivo solicitado desde la carpeta 'public'
// (que está en la raíz del proyecto)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/favicon.ico', (req: Request, res: Response) => {
    res.status(204).send();
});

// Ruta de prueba para EJS (Asegúrate de tener una)
app.get('/', (req: Request, res: Response) => {
    res.render('index', { 
        titulo: 'Zyrex EJS Test',
        productos: [], // Pasa un array vacío si no cargas datos
        user: req.session.user || null // Pasa null si no hay usuario
    });
});

app.use(authRouter);
app.use(artisanRouter);
app.use("/products", productRouter);

// ---- MANEJO DE RUTAS NO ENCONTRADAS (404) ----
app.use((req: Request, res: Response, next: NextFunction) => {
  // Si es API, responde JSON, si no, renderiza vista 404.ejs
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ message: 'Endpoint de API no encontrado' });
  } else {
    res.status(404).render('404', { // Asume que tienes 'views/404.ejs'
        titulo: 'Página no Encontrada',
        user: (req as any).user // O null
    });
  }
});

export default app;