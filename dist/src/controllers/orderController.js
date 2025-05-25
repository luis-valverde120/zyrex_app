"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrders = exports.displayOrderConfirmation = void 0;
const prisma_1 = require("../lib/prisma");
const displayOrderConfirmation = async (req, res, next) => {
    try {
        const { pedidoId } = req.params;
        const userId = req.session.user?.id;
        if (!userId) {
            return res.redirect("/login");
        }
        const pedido = await prisma_1.prisma.pedido.findUnique({
            where: { id: pedidoId, usuarioId: userId },
            include: {
                items: {
                    include: {
                        producto: {
                            select: {
                                id: true,
                                nombre: true,
                                imagenes: true,
                                precio: true,
                            },
                        },
                    },
                },
                usuario: {
                    select: {
                        nombre: true,
                        email: true,
                    },
                },
            },
        });
        if (!pedido) {
            return res.status(404).render("error", {
                title: "Pedido no encontrado",
                message: "No se encontró el pedido solicitado.",
            });
        }
        res.render("orderConfirmation", {
            title: "Confirmación de Pedido",
            pedido,
        });
    }
    catch (error) {
        console.error("Error displaying order confirmation:", error);
        next(error);
    }
};
exports.displayOrderConfirmation = displayOrderConfirmation;
// list orders
const listOrders = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.redirect("/login");
        }
        const pedidos = await prisma_1.prisma.pedido.findMany({
            where: { usuarioId: userId },
            include: {
                items: {
                    include: {
                        producto: {
                            select: {
                                id: true,
                                nombre: true,
                                imagenes: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.render("my-orders", {
            title: "Mis Pedidos",
            pedidos,
        });
    }
    catch (error) {
        console.error("Error listing orders:", error);
        next(error);
    }
};
exports.listOrders = listOrders;
