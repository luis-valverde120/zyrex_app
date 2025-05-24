import e, { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { CartItem } from "../middlewares/authMiddleware";
import { prependListener } from "process";

export const handleAddToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity: quantityStr } = req.body;
    const userId = req.session.user.id;

    if(!userId) {
      res.redirect("/login");
      return;
    }

    if (!productId || !quantityStr) {
      res.status(400).json({ message: "Product ID and quantity are required" });
      return;
    }

    const quantity = parseInt(quantityStr, 10);

    if (isNaN(quantity) || quantity <= 0) {
      res.redirect(req.header('Referer') || "/");
      return;
    }

    const product = await prisma.producto.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).redirect("/");
      return;
    }

    // Check if the cuantity is available
    if (product.stock < quantity) {
      res.status(400).json({ message: "Insufficient stock" });
      return;
    }

    // find cart of user
    let userCart = await prisma.carrito.findUnique({
      where: { usuarioId: userId },
      include: { items: true }, // Include the items in the cart
    });

    if (!userCart) {
      userCart = await prisma.carrito.create({
        data: {
          usuarioId: userId,
        },
        include: { items: true }, // Include the items in the newly created cart
      });
    }


    const existingItem = await prisma.itemCarrito.findFirst({
      where: {
        carritoId: userCart.id,
        productoId: productId,
      },
    });

    if (existingItem) {
      // Update the existing item quantity
      const newQuantity = existingItem.cantidad + quantity;
      if (newQuantity > product.stock) {
        console.error("Insufficient stock");
        res.redirect(req.header('Referer') || "/");
        return;
      }
      await prisma.itemCarrito.update({
        where: { id: existingItem.id },
        data: { cantidad: newQuantity },
      });
    } else {
      await prisma.itemCarrito.create({
        data: {
          carritoId: userCart.id,
          productoId: product.id,
          cantidad: quantity,
        },
      });

      console.log("Item added to cart:")
    }

    res.redirect(req.header('Referer') || "/");

  } catch (error) {
    console.error("Error adding to cart: ok", error);
    res.status(500).redirect(req.header('Referer') || "/");
  }
}

// view cart
export const displayCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.user.id;

    if (!userId) {
      res.redirect("/login");
      return;
    }

    const userCart = await prisma.carrito.findUnique({
      where: { usuarioId: userId },
      include: {
        items: {
          include: {
            producto: true, // Include product details
          },
        },
      },
    });

    
    let cartItemsForView: CartItem[] = [];
    let subtotalCarrito = 0;
    let totalItems = 0;

   if (userCart && userCart.items && userCart.items.length > 0) { //  Añadido userCart.items.length > 0
      cartItemsForView = userCart.items.map(item => {
        // 👇 ¡PUNTO CRÍTICO AQUÍ!
        // Si 'item.producto' es null o undefined por alguna razón
        // (ej. un producto fue borrado de la BD pero el ItemCarrito aún existe y onDelete no es CASCADE)
        // entonces item.producto.precio daría error aquí mismo.
        // Pero si llega a calcular subtotalCarrito, entonces item.producto y item.producto.precio existían.

        // Para estar seguros, añadamos una verificación:
        if (!item.producto || typeof item.producto.precio !== 'number' || typeof item.cantidad !== 'number') {
            console.error('ItemCarrito problemático o producto asociado faltante:', JSON.stringify(item, null, 2));
            // Decide cómo manejar este item: omitirlo, poner valores por defecto, etc.
            // Por ahora, para evitar el error en EJS, podríamos omitirlo o poner precio 0.
            // Si lo omites, el 'totalItems' y 'subtotalCarrito' podrían no coincidir con el número de {} en el log.
            // Es mejor asegurarse que item.producto y sus propiedades necesarias existan.
            // Si item.producto no existe, el include de Prisma falló o hay datos huérfanos.
            return null; // O un objeto con valores por defecto que no rompan .toFixed()
        }

        const itemSubtotal = item.producto.precio * item.cantidad;
        subtotalCarrito += itemSubtotal;
        totalItems += item.cantidad;

        return {
          productId: item.producto.id,
          nombre: item.producto.nombre,
          precio: item.producto.precio, // 👈 Debe ser un número
          quantity: item.cantidad,
          imagen: (item.producto.imagenes && item.producto.imagenes.length > 0) ? item.producto.imagenes[0] : undefined,
          stock: item.producto.stock,
          itemTotal: itemSubtotal
        };
      }).filter(item => item !== null); // 👈 Filtra los items nulos si decidiste omitirlos
    } 

   const totalCarrito = subtotalCarrito;

    const viewData = {
      titulo: 'Mi Carrito de Compras',
      cartItems: cartItemsForView, // 👈 ¿Qué contiene esto exactamente?
      subtotalCarrito: subtotalCarrito,
      totalItems: totalItems,
      totalCarrito: totalCarrito,
    };

    // Log más detallado de cartItemsForView ANTES de JSON.stringify
    console.log('CONTROLLER: cartItemsForView ANTES de stringify:', cartItemsForView);
    cartItemsForView.forEach((ci, index) => {
        console.log(`CONTROLLER: Item ${index} precio tipo: ${typeof ci.precio}, valor: ${ci.precio}`);
    });

    console.log('DEBUG: Datos enviados a cart.ejs:', JSON.stringify(viewData, null, 2));
    res.render('cart', viewData);


  } catch (error) {
    console.error("Error displaying cart:", error);
    res.status(500).redirect(req.header('Referer') || "/");
  }
}

export const handleRemoveFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      res.redirect("/login");
      return;
    }

    const userCart = await prisma.carrito.findUnique({
      where: { usuarioId: userId },
      include: { items: true },
    });

    // its nothing in the cart
    if (!userCart) {
      res.redirect("/cart");
      return;
    }

    const deleteResult = await prisma.itemCarrito.deleteMany({
      where: {
        carritoId: userCart.id,
        productoId: productId,
      },
    });

    if (deleteResult.count > 0) {
      console.log(`Item with productId ${productId} removed from cart.`);

    } else {
      console.log(`Item with productId ${productId} not found in cart.`);
    }

    res.redirect('/cart')

  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).redirect(req.header('Referer') || "/");
  }
}

export const handleUpdateCartQuantity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { quantity: quantityStr } = req.body;
    const userId = req.session.user.id;

    if (!userId) {
      res.redirect("/login");
      return;
    }

    const quantity = parseInt(quantityStr, 10);

    if (isNaN(quantity) || quantity <= 0) {
      res.redirect("/cart");
      return;
    }

    const userCart = await prisma.carrito.findUnique({
      where: { usuarioId: userId },
      include: { items: true },
    });

    if (!userCart) {
      res.redirect("/cart");
      return;
    }

    // quaitity is 0 delete product
    if (quantity === 0) {
      await prisma.itemCarrito.deleteMany({
        where: {
          carritoId: userCart.id,
          productoId: productId,
        },
      });

      console.log(`Item with productId ${productId} removed from cart.`);
      return res.redirect('/cart');
    }

    const productDB = await prisma.producto.findUnique({
      where: { id: productId },
    });

    if (!productDB) {
      res.status(404).redirect("/cart");
      return;
    }

    if (productDB.stock < quantity) {
      return res.redirect("/cart");
    }

    // update cuantity of cart
    const updateItem = await prisma.itemCarrito.updateMany({
      where: {
        carritoId: userCart.id,
        productoId: productId,
      },
      data: {
        cantidad: quantity,
      },
    });
    
    if (updateItem.count > 0) {
      console.log(`Item with productId ${productId} updated to quantity ${quantity}.`);
    } else {
      console.log(`Item with productId ${productId} not found in cart.`);
    }

    res.redirect('/cart');

  } catch (error) {
    console.error("Error updating cart quantity:", error);
    next(error);
  }

}