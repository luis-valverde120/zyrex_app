import path from "path";
import express, { CookieOptions, Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import { 
  authRouter, 
  artisanRouter, 
  productRouter, 
  catalogoRouter, 
  checkoutRouter,
  orderRouter
} from "./routes";
import { Prisma } from "@prisma/client";
import cartRouter from "./routes/cartRoutes";


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

// homepage route
app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Obtener el número de página desde la query, por defecto 1
    const limit = parseInt(req.query.limit as string) || 8; // Obtener el límite de productos por página, por defecto 10
    const skip = (page - 1) * limit; // Calcular el número de productos a saltar

    const whereCondition: Prisma.ProductoWhereInput =  {
      stock: {
        gt: 0 // Solo productos con stock mayor a 0
      }
    }

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

  } catch (error) {
    console.error("Error fetching products:", error);
    next(error);
  }

});

// about page route
app.get('/about', (req: Request, res: Response) => {
  res.render('about', {
    titulo: 'Sobre Nosotros - Zyrex',
    // 'user' ya está disponible globalmente via res.locals.user si está configurado
  });
});


app.use(authRouter);
app.use(artisanRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use(catalogoRouter)
app.use('/checkout', checkoutRouter);
app.use('/orders', orderRouter);

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