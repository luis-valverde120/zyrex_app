import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

// loginUser is a function that handles user login
async function loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email, password } = req.body;

  // validate the user data
  if (!email || !password) {
    res.status(400).json({
      message: "Email and password are required",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // validate the user
    if (!user) {
      res.status(401).render("login", {
        title: "Iniciar sesión",
        error: "Invalid email or password",
      });
      return;
    }

    // validate the password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).render("login", {
        title: "Iniciar sesión",
        error: "Invalid email or password",
      });
      return;
    }

    // ---- INICIO DE SESIÓN EXITOSO ----
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.nombre,
      direccion: user.direccion,
      telefono: user.telefono,
      rol: user.rol,
    };

    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      // redirect to the home page
      res.redirect("/");
    });


  } catch (error) {
    console.error("Error checking user:", error);
    // this is for unexpected errors
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

// registerUser is a function that handles user registration
async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const {
    nombre,
    email,
    password,
    confirmPassword,
    direccion,
    telefono,
    esArtesano,
  } = req.body;

  const formsValues = {
    nombre,
    email,
    password,
    confirmPassword,
    telefono,
    direccion,
    esArtesano,
  } as any;

  if (!nombre || !email || !password || !confirmPassword || !direccion || !telefono) {
    res.status(400).render("register", {
      title: "Crear Cuenta",
      error: "All fields are required",
      values: formsValues,
    });
    return;
  }

  // check if passowrd is equal to the confirm password
  if (password !== confirmPassword) {
    res.status(400).render("register", {
      title: "Crear Cuenta",
      error: "Passwords do not match",
      values: formsValues,
    });

    return;
  }

  if (password.length < 6) {
    res.status(400).render("register", {
      title: "Crear Cuenta",
      error: "Password must be at least 6 characters long",
      values: formsValues,
    });
    return;
  }

  try {
    const existUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existUser) {
      res.status(400).render("register", {
        title: "Crear Cuenta",
        error: "Email already exists",
        values: formsValues,
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // get role user
    const userRole = esArtesano ? "ARTESANO" : "CLIENTE";

    const newUser = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        direccion,
        telefono,
        rol: userRole,
      },
    });

    console.log("User created:", newUser);
    // ---- REGISTRO EXITOSO ----
    res.redirect("/login");

  } catch (error) {
    console.error("Error checking user:", error);
    // this is for unexpected errors
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }

};

export { loginUser, registerUser };
