"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const artisanRouter = (0, express_1.Router)();
// get routes
// ---- Inventory ----
artisanRouter.get("/inventory", authMiddleware_1.ensureAuthenticated, authMiddleware_1.ensureArtisan, async (req, res) => {
    try {
        const artesanoId = req.session.user.id;
        const searchTerm = req.query.searchTerm || ""; // Obtener el término de búsqueda de la consulta
        if (!artesanoId) {
            res.status(403).render("error", {
                title: "Acceso Denegado",
                message: "No tienes permiso para acceder a esta página."
            });
            return;
        }
        const whereClause = {
            artesanoId,
        };
        if (searchTerm.trim() !== "") {
            whereClause.OR = [
                { nombre: { contains: searchTerm, mode: "insensitive" } },
                { descripcion: { contains: searchTerm, mode: "insensitive" } },
            ];
        }
        const productosDelArtesano = await prisma_1.prisma.producto.findMany({
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
    }
    catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).render("error", {
            title: "Error",
            message: "An error occurred while fetching the inventory."
        });
    }
});
exports.default = artisanRouter;
