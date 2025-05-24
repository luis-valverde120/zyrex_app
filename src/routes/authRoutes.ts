
import { Router, Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "../controllers/authController";
import { title } from "process";

const authRouter = Router();

// get routes
// ---- LOGIN ----
authRouter.get("/login", (req: Request, res: Response) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("login", {
    title: "Iniciar sesión",
    error: null
  });
});

// ---- REGISTRO ----
authRouter.get('/register', (req: Request, res: Response) => {
    // Si el usuario ya está logueado, quizás redirigirlo a la home
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('register', {
        titulo: 'Crear Cuenta',
        error: null,
        values: {} // Para repoblar el formulario en caso de error
    });
});

// post routes
authRouter.post("/login", loginUser)
authRouter.post("/register", registerUser)
authRouter.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => { // Destruye la sesión
    if (err) {
      return next(err);
    }
    res.redirect('/login'); // Redirige a login
  });
});

export default authRouter;
