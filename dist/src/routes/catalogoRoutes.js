"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const catalogoRouter = (0, express_1.Router)();
// Ruta para la Página de Catálogo con Paginación
catalogoRouter.get('/catalogo', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // Mostrar 12 productos por página
        const skip = (page - 1) * limit;
        // Opcional: Filtro por categoría si se pasa como query param
        const categoriaQuery = req.query.categoria;
        const whereCondition = {
            stock: { gt: 0 }, // Solo productos con stock
            // Si se pasó una categoría, filtramos por ella
            ...(categoriaQuery && { categoriaId: categoriaQuery })
        };
        const [productos, totalCount] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.producto.findMany({
                skip: skip,
                take: limit,
                where: whereCondition,
                orderBy: {
                    createdAt: 'desc', // O por nombre, precio, etc.
                },
                include: {
                    categoria: true, // Para mostrar el nombre de la categoría
                },
            }),
            prisma_1.prisma.producto.count({
                where: whereCondition,
            }),
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        // Para el filtro de categorías en la vista (opcional)
        const todasLasCategorias = await prisma_1.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
        res.render('catalogo', {
            titulo: 'Catálogo de Artesanías',
            productos: productos,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            totalCount: totalCount,
            categorias: todasLasCategorias, // Para mostrar filtros
            selectedCategoria: categoriaQuery || '' // Para marcar la categoría seleccionada
            // 'user' ya está disponible globalmente via res.locals.user
        });
    }
    catch (error) {
        console.error("Error al cargar la página de catálogo:", error);
        next(error);
    }
});
catalogoRouter.get('/catalogo/search', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // Mostrar 12 productos por página
        const skip = (page - 1) * limit;
        // Opcional: Filtro por categoría si se pasa como query param
        const categoriaQuery = req.query.categoria;
        const searchTerm = req.query.q || ""; // Obtener el término de búsqueda de la consulta
        console.log("DEBUG: searchTerm:", searchTerm);
        const whereCondition = {
            stock: { gt: 0 }, // Solo productos con stock
            // Si se pasó una categoría, filtramos por ella
            ...(categoriaQuery && { categoriaId: categoriaQuery })
        };
        if (searchTerm.trim() !== "") {
            whereCondition.OR = [
                { nombre: { contains: searchTerm, mode: "insensitive" } },
                { descripcion: { contains: searchTerm, mode: "insensitive" } },
            ];
        }
        const [productos, totalCount] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.producto.findMany({
                skip: skip,
                take: limit,
                where: whereCondition,
                orderBy: {
                    createdAt: 'desc', // O por nombre, precio, etc.
                },
                include: {
                    categoria: true, // Para mostrar el nombre de la categoría
                },
            }),
            prisma_1.prisma.producto.count({
                where: whereCondition,
            }),
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        // Para el filtro de categorías en la vista (opcional)
        const todasLasCategorias = await prisma_1.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
        res.render('catalogo', {
            titulo: 'Catálogo de Artesanías',
            productos: productos,
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            totalCount: totalCount,
            categorias: todasLasCategorias, // Para mostrar filtros
            selectedCategoria: categoriaQuery || '', // Para marcar la categoría seleccionada
            searchTerm: searchTerm, // Para mantener el término de búsqueda en la vista
            // 'user' ya está disponible globalmente via res.locals.user
        });
    }
    catch (error) {
        console.error("Error al cargar la página de catálogo:", error);
        next(error);
    }
});
exports.default = catalogoRouter;
