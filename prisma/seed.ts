import { PrismaClient, Role } from "@prisma/client";
import { existsSync } from "fs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // -- CATEGORIES --
  const categoriesDeffault = [
    { nombre: "Ceramica" },
    { nombre: "Textiles" },
    { nombre: "Madera Tallada" },
    { nombre: "Joyería Artesanal" },
    { nombre: "Piedra" },
    { nombre: "Pintura" },
    { nombre: "instrumentos Musicales" },
    { nombre: "Recuerdos y Souvenirs" },
    { nombre: "Otros" },
  ];

  for (const category of categoriesDeffault) {
    const cat = await prisma.categoria.upsert({
      where: { nombre: category.nombre },
      update: {},
      create: {
        nombre: category.nombre,
      },
    });
    console.log(`Category created: ${cat.nombre}`);
  }

  console.log("Categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding completed!");
    await prisma.$disconnect();
  });
