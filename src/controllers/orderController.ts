import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const displayOrderConfirmation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pedidoId } = req.params;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.redirect("/login");
    }

    const pedido = await prisma.pedido.findUnique({
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


  } catch (error) {
    console.error("Error displaying order confirmation:", error);
    next(error);
  }
}

// list orders
export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      return res.redirect("/login");
    }

    const pedidos = await prisma.pedido.findMany({
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
  } catch (error) {
    console.error("Error listing orders:", error);
    next(error);
  }
}