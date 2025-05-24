import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";
import fs from "fs";
import path from "path";
import { error } from "console";

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

// get form of edit product
export const displayEditProductForm = async (req: Request, res: Response, next: NextFunction) => {
  // Check if the user is authenticated
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.rol !== Role.ARTESANO) {
    return res.status(403).render("error", {
      title: "Acceso Denegado",
      message: "No tienes permiso para acceder a esta página.",
      user: req.session.user, // Pass the user to
    }); 
  }

  try {

    const { id: productId } = req.params;
    const product = await prisma.producto.findUnique({
      where: {
        id: productId,
      },
      include: {
        categoria: true,
      },
    });

    // check if the product exists
    if (!product) {
      return res.status(404).render("error", {
        title: "Producto no encontrado",
        message: "El producto que estás buscando no existe.",
        user: req.session.user, // Pass the user to the view
      });
    }

    const categories = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    res.render("edit-product", {
      title: `Editar Producto: ${product.nombre}`,
      producto: product,
      categorias: categories,
      user: req.session.user, // Pass the user to the view
      error: null,
      values: product
    });



  } catch (error) {
    next(error);
  }
}

export const handleEditProduct = async (req: Request, res: Response, next: NextFunction) => { 
  const { id: productId } = req.params;
  const { nombre, descripcion, precio, stock, categoriaId } = req.body;
  const artesanoId = req.session.user?.id;

  if (!artesanoId) {
    return res.status(403).render("error", {
      title: "Acceso Denegado",
      message: "No tienes permiso para acceder a esta página.",
      user: req.session.user, // Pass the user to
    });
  }

  const formsValues = {
    id: productId,
    nombre,
    descripcion,
    precio,
    stock,
    categoriaId,
  };

  if (!nombre || !descripcion || !precio || !stock || !categoriaId) {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });
    const currentProduct = await prisma.producto.findUnique({
      where: {
        id: productId,
      },
    });
    return res.render("edit-product", {
      title: "Editar Producto",
      error: "Todos los campos son obligatorios",
      categorias,
      user: req.session.user, // Pass the user to the view
      formsValues,
      producto: currentProduct,
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
    const currentProduct = await prisma.producto.findUnique({
      where: {
        id: productId,
      },
    });
    return res.render("edit-product", {
      title: "Editar Producto",
      error: "El precio y el stock deben ser números",
      producto: {...currentProduct, ...formsValues},
      categorias,
      values: formsValues
    });

  }

  try {
    const productoExistente = await prisma.producto.findUnique({
      where: {
        id: productId,
        artesanoId: artesanoId,
      },
    });

    if (!productoExistente) {
      return res.status(404).render("error", {
        title: "Producto no encontrado",
        message: "El producto que estás buscando no existe o no tienes permiso para editarlo.",
      });
    }

    let imagePathArray = productoExistente.imagenes || [];

    if (req.file) {
      imagePathArray = [`/uploads/${req.file.filename}`];
    }

    const productUpdate = await prisma.producto.update({
      where: {
        id: productId,
      },
      data: {
        nombre,
        descripcion: descripcion || null,
        precio: precioFloat,
        stock: stockInt,
        imagenes: imagePathArray,
        categoriaId: categoriaId || null,
      }
    });

    console.log("Producto actualizado:", productUpdate);

    res.redirect("/inventory");


  } catch (error) {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: "asc",
      },
    });
    const currentProduct = await prisma.producto.findUnique({
      where: {
        id: productId,
      },
    });
    console.error("Error updating product:", error);
    return res.status(500).render("error", {
      title: "Error",
      message: "An error occurred while updating the product.",
      producto: {...currentProduct, ...formsValues},
      categorias,
      values: formsValues,
    });
  }
}

export const handleDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { id: productId } = req.params;
  const artesanoId = req.session.user?.id;

  if (!artesanoId) {
    return res.status(403).render("error", {
      title: "Acceso Denegado",
      message: "No tienes permiso para acceder a esta página.",
      user: req.session.user, // Pass the user to  

    });
  }

  try {
    const product = await prisma.producto.findUnique({
      where: {
        id: productId,
        artesanoId: artesanoId,
      },
      select: {
        imagenes: true,
      }
    });

    if (!product) {
      return res.status(404).redirect("/inventory");
    }

    if (product.imagenes && product.imagenes.length > 0) {
      for (const imagePath of product.imagenes) {
        if (imagePath) {
          const fullPath = path.join(__dirname, "..", "..", "public", imagePath);
          try {
            await fs.unlinkSync(fullPath);
            console.log(`Imagen eliminada: ${fullPath}`);
          } catch (err) {
            console.error(`Error al eliminar la imagen: ${fullPath}`, err);
          }
        }
      }
    };

    await prisma.producto.deleteMany({
      where: {
        id: productId,
        artesanoId: artesanoId,
      }
    });

    console.log("Producto eliminado:", productId);
    res.redirect("/inventory");

  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).render("error", {
      title: "Error",
      message: "An error occurred while deleting the product.",
      user: req.session.user, // Pass the user to
    });
  }
}

// get product information
export const displayProductInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: productId } = req.params;
    const product = await prisma.producto.findUnique({
      where: {
        id: productId,
      },
      include: {
        categoria: true,
        artesano: true,
      },
    });
    
    if (!product) {
      return res.status(404).render("404", {
        title: "Producto no encontrado",
        message: "El producto que estás buscando no existe.",
        user: req.session.user, // Pass the user to the view
      });
    }

    res.render("product-info", {
      titulo: `Información del Producto: ${product.nombre}`,
      producto: product,
    });

  } catch (error) {
    console.error("Error fetching product information:", error);
    return res.status(500).render("error", {
      title: "Error",
      message: "An error occurred while fetching the product information.",
    });
  }
}