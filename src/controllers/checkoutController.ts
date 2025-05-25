import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { CartItem } from '../middlewares/authMiddleware';
import { EstadoPedido } from '@prisma/client';

export const displayCheckoutPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.user.id;

    if (!userId) {
      return res.redirect('/login');
    }

    // Fetch the user's cart
    const userCart = await prisma.carrito.findUnique({
      where: { usuarioId: userId },
      include: {
        items: {
          orderBy: { addedAt: 'asc' }, // Order items by the time they were added
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                precio: true,
                imagenes: true,
                stock: true,
              }
            }
          },
        },
      },
    });

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.render('checkout', {
        title: 'Checkout',
        error: 'Your cart is empty.',
        cartItems: [],
      });
    }

    let cartItemsForView: any[] = [];
    let subtotalCarrito = 0;
    let totalItems = 0;

    userCart.items.forEach((item) => {
      if (item.producto) {
        const itemSubtotal = item.producto.precio * item.cantidad;
        subtotalCarrito += itemSubtotal;
        totalItems += item.cantidad;
        cartItemsForView.push({
          productId: item.producto.id,
          nombre: item.producto.nombre,
          precio: item.producto.precio,
          quantity: item.cantidad,
          imagen: (item.producto.imagenes && item.producto.imagenes.length > 0) ? item.producto.imagenes[0] : undefined, // Use the first image URL or an empty string
          itemTotal: itemSubtotal,
        });
      }
    });

    if (cartItemsForView.length === 0) {
      return res.redirect('/cart'); // Redirect to cart if no items are available
    } 

    const totalCarrito = subtotalCarrito;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        direccion: true,
        telefono: true,
      },
    });

    res.render('checkout', {
      title: 'Checkout',
      cartItems: cartItemsForView,
      subtotalCarrito,
      totalItems,
      totalCarrito,
      direccionEnvioActual: currentUser?.direccion || '',
      nombreCompletoActual: currentUser?.nombre || '',
      telefonoActual: currentUser?.telefono || '',
    });
 
  } catch (error) {
    console.error('Error displaying checkout page:', error);
    res.redirect(req.header('Referer') || '/');
  }
}

export const handlePlaceOrder = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.user.id;

  if (!userId) {
    return res.redirect('/login');
  }

  const { nombreCompleto, direccionEnvio, ciudad, telefonoContacto} = req.body;
  if (!nombreCompleto || !direccionEnvio || !ciudad || !telefonoContacto) {
    return res.status(400).render('checkout', {
      title: 'Checkout',
      error: 'Please fill in all required fields.',
    });
  }

  try {
    const userCart = await prisma.carrito.findUnique({
      where: { usuarioId: userId },
      include: {
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.redirect('/cart'); // Redirect to cart if no items are available
    }

    // validar el stock
    let calculatedTotal = 0;
    const itemsParaPedido: Array<{
      productoId: string;
      quantity: number;
      precio: number;
      nombreProducto: string;
    }> = [];

    for (const item of userCart.items) {
      if (!item.producto) {
        console.error('Product not found for item:', item);
        return res.status(400).render('checkout', {
          title: 'Checkout',
          error: 'Some products are not available.',
        });
      }

      if (item.cantidad > item.producto.stock) {
        return res.status(400).render('checkout', {
          title: 'Checkout',
          error: `Insufficient stock for ${item.producto.nombre}.`,
        });
      }

      itemsParaPedido.push({
        productoId: item.producto.id,
        quantity: item.cantidad,
        precio: item.producto.precio,
        nombreProducto: item.producto.nombre,
      });
      calculatedTotal += item.producto.precio * item.cantidad;
    }

    const direccionCompleta = `${nombreCompleto}\n${direccionEnvio}\n${ciudad}\n${telefonoContacto}`;

    const peidoCreado = await prisma.$transaction(async (tx) => {
      // create order
      const nuevoPedido = await tx.pedido.create({
        data: {
          usuarioId: userId,
          direccionEnvio: direccionCompleta,
          total: calculatedTotal,
          estado: EstadoPedido.PAGADO,
        }
      })

      // create order items
      const itemsPeidoData = itemsParaPedido.map(item => ({
        pedidoId: nuevoPedido.id,
        productoId: item.productoId,
        cantidad: item.quantity,
        precioUnidad: item.precio,
      }));

      await tx.itemPedido.createMany({
        data: itemsPeidoData,
      });

      for (const item of itemsParaPedido) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.itemCarrito.deleteMany({
        where: { carritoId: userCart.id },
      });

      await tx.carrito.delete({
        where: { id: userCart.id },
      });
        
      return nuevoPedido;
    });

    console.log('Order created successfully:', peidoCreado);

    res.redirect(`/orders/confirmation/${peidoCreado.id}`);

  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).render('checkout', {
      title: 'Checkout',
      error: 'An error occurred while processing your order.',
    });
  }
}