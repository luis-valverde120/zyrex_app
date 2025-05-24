import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ensureAuthenticated, ensureArtisan } from "../middlewares/authMiddleware";
import { Prisma } from "@prisma/client";


const artisanRouter = Router();

// get routes
// ---- Inventory ----
artisanRouter.get("/inventory", ensureAuthenticated, ensureArtisan, async (req: Request, res: Response) => {
  try {
    const artesanoId = req.session.user.id;
    const searchTerm = req.query.searchTerm as string || ""; // Obtener el término de búsqueda de la consulta

    if (!artesanoId) {
      res.status(403).render("error", {
        title: "Acceso Denegado",
        message: "No tienes permiso para acceder a esta página."
      });
      return;
    }

    const whereClause: Prisma.ProductoWhereInput = {
      artesanoId,
    };

    if (searchTerm.trim() !== "") {
      whereClause.OR = [
        { nombre: { contains: searchTerm, mode: "insensitive" } },
        { descripcion: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const productosDelArtesano = await prisma.producto.findMany({
      where: whereClause,
      orderBy: {
        nombre: "asc",
      },
      include: { categoria: true },
    });

    res.render("inventory", {
      title: "Inventario",
      productos: productosDelArtesano,
      user: req.session.user // Pasar el usuario a la vista
    });

  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "An error occurred while fetching the inventory."
    });
  }
});

export default artisanRouter;
