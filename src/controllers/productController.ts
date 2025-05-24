import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";
import { error } from "console";
import { parse } from "path";

// get form of create product
export const displayNewProductForm = async (req: Request, res: Response, next: NextFunction) => {
  // Check if the user is authenticated
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  // Check if the user is an artisan
  if (req.session.user.rol !== Role.ARTESANO) {
    return res.status(403).render("error", {
      title: "Acceso Denegado",
      message: "No tienes permiso para acceder a esta página.",
      user: req.session.user, // Pass the user to the view
    });
  }

  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });


    res.render("new-product", {
      title: "Crear Producto",
      categorias,
      user: req.session.user, // Pass the user to the view
    });
  } catch (error) {
    next(error);
  }
};

// process the creation of new product
export const handleCreateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { nombre, descripcion, precio, stock, categoriaId } = req.body;
  const artesanoId = req.session.user.id;

  const formsValues = {
    nombre,
    descripcion,
    precio,
    stock,
    categoriaId,
  };

  // Validate data product
  if (!nombre || !descripcion || !precio || !stock || !categoriaId) {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return res.render("new-product", {
      title: "Crear Producto",
      error: "Todos los campos son obligatorios",
      categorias,
      user: req.session.user, // Pass the user to the view
      formsValues,
    });
  }

  if (!req.file) {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return res.render("new-product", {
      title: "Crear Producto",
      error: "Debe subir una imagen",
      categorias,
      user: req.session.user, // Pass the user to the view
      formsValues,
    });
  }

  if (!artesanoId) {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return res.render("new-product", {
      title: "Crear Producto",
      error: "No tienes permiso para acceder a esta página.",
      categorias,
      user: req.session.user, // Pass the user to the view
      formsValues,
    });
  }

  const precioFloat = parseFloat(precio);
  const stockInt = parseInt(stock);

  if (isNaN(precioFloat) || isNaN(stockInt)) {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return res.render("new-product", {
      title: "Crear Producto",
      error: "El precio y el stock deben ser números",
      categorias,
      user: req.session.user, // Pass the user to the view
      formsValues,
    });
  }

  try {

    const imagePath = `/uploads/${req.file.filename}`;

    const newProuct = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: precioFloat,
        stock: stockInt,
        imagenes: [imagePath],
        categoriaId: categoriaId || null,
        artesanoId,
      },
    });

    console.log("Producto creado:", newProuct);

    // Redirect to the inventory page or any other page
    res.redirect("/inventory");

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).render("error", {
      title: "Error",
      message: "An error occurred while creating the product.",
      user: req.session.user, // Pass the user to the view
    });
  }

}
