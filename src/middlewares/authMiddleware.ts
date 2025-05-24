import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

// Interface for the session user
declare module "express-session" {
  interface SessionData {
    user?: any
  }
}

/**
 * Middleware para asegurar que el usuario esta autenticado.
 * Si no lo redirigue a login
 *  */ 

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    return next();
  } 

  res.redirect("/login");
};

/**
 * Middleware para asegurar que el usuario es un artesano.
 */

export const ensureArtisan = (req: Request, res: Response, next: NextFunction) => {
  // Verifica si el usuario está autenticado
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  // verrificacion del rol
  if (req.session.user.rol === Role.ARTESANO) {
    return next();
  }

  res.status(403).render("error", {
    title: "Acceso Denegado",
    message: "No tienes permiso para acceder a esta página.",
    user: req.session.user // Pasar el usuario a la vista
  });
}

/**
 * Middleware para asegurar que el usuario es un administrador.
 */

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  // verrificacion del rol
  if (req.session.user.rol === Role.ADMIN) {
    return next();
  }
  
  res.status(403).render("error", {
    title: "Acceso Denegado",
    message: "No tienes permiso para acceder a esta página.",
    user: req.session.user // Pasar el usuario a la vista
  });
}
