const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    // Deletar todos os serviços, barbeiros e barbearias existentes
    await prisma.booking.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.barber.deleteMany({});
    await prisma.barbershop.deleteMany({});

    const barbearias = [
      {name:"Barbearia Muniz - Centro de Cotia", address:"Rua Guido Fecchio, 626", imageUrl:"https://utfs.io/f/7b5ef062-eade-49d2-b1d0-0dc43b27074b-26gp.PNG"},
      {name:"Barbearia Muniz - Granja Vianna", address:"N/A", imageUrl:"https://utfs.io/f/be200e80-0cd7-40d7-be3a-d3e2e7de489d-wohl99.webp"},
    ];

    const barbeiros = [
      { name: "Matheus Muniz", imageUrl: "https://utfs.io/f/b80ed175-fdbf-4368-8f16-7b406607bddf-dwpqd7.PNG" },
      { name: "Carlos Henrique", imageUrl: "https://utfs.io/f/0755d44f-ec04-440f-af8d-07c8a9fd881f-mm8c1w.PNG" },
      { name: "Adilson", imageUrl: "https://utfs.io/f/dc2fe8ac-37d4-4b9d-8b3e-d1f39b933fe8-1fyf3.PNG" },
    ];

    const services = [
      {
        name: "Corte de Cabelo",
        description: "Estilo personalizado com as últimas tendências.",
        price: 35.0,
        imageUrl: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Barba",
        description: "Modelagem completa para destacar sua masculinidade.",
        price: 25.0,
        imageUrl: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Pézinho",
        description: "Acabamento perfeito para um visual renovado.",
        price: 10.0,
        imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Sobrancelha",
        description: "Expressão acentuada com modelagem precisa.",
        price: 10.0,
        imageUrl: "https://utfs.io/f/96cc47a2-a459-446b-8db5-09c4a9d09444-fl396.jpg",
      },
      {
        name: "Penteado",
        description: "Acabamento perfeito para seu cabelo.",
        price: 25.0,
        imageUrl: "https://utfs.io/f/0cfc142a-3b1e-4311-a48e-f838977439f9-2225fi.jpg",
      },
      {
        name: "Alisante/Relaxamento",
        description: "Deixe seu cabelo liso e com uma aparência mais natural",
        price: 25.0,
        imageUrl: "https://utfs.io/f/20905ade-28e4-4de3-8ebc-511c55b8d827-8vlao.PNG",
      },
      {
        name: "Pigmentação",
        description: "Acabamento para seu penteado",
        price: 25.0,
        imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Luzes/Reflexo",
        description: "Luzes e reflexos perfeitos para seu momento",
        price: 60.0,
        imageUrl: "https://utfs.io/f/e3a14159-99e0-4a44-83f5-356ac3f9a2bf-u3521m.jpg",
      },
      {
        name: "Platinado",
        description: "Platinado perfeito para uma mudança de estilo radical",
        price: 150.0,
        imageUrl: "https://utfs.io/f/61cd1d29-dce7-4b31-b719-9f3446c2248a-fkrunw.26.54.jpeg",
      },
      {
        name: "Progressiva",
        description: "Cabelo alinhado, hidratado e liso",
        price: 150.0,
        imageUrl: "https://utfs.io/f/98de6850-1c0b-4644-86ee-4643ce4acb1e-fkrunw.26.50.jpeg",
      },
    ];
    // Criar barbearias
    for (const barbearia of barbearias) {
      await prisma.barbershop.create({
        data: {
          name: barbearia.name,
          address: barbearia.address,
          imageUrl: barbearia.imageUrl,
        }
      });
    }

    // Criar serviços e associá-los às barbearias
    for (const barbearia of barbearias) {
      const createdBarbershop = await prisma.barbershop.findUnique({
        where: {
          name: barbearia.name,
        },
      });

      for (const service of services) {
        await prisma.service.create({
          data: {
            ...service,
            barbershop: {
              connect: {
                id: createdBarbershop.id,
              },
            },
          },
        });
      }
    }

    // Criar barbeiros e associá-los às barbearias
    for (const barbeiro of barbeiros) {
      const createdBarbershop = await prisma.barbershop.findFirst();

      await prisma.barber.create({
        data: {
          name: barbeiro.name,
          imageUrl: barbeiro.imageUrl,
          barbershop: {
            connect: {
              id: createdBarbershop.id,
            },
          },
        },
      });
    }

    // Fechar a conexão com o banco de dados
    await prisma.$disconnect();
  } catch (error) {
    console.error("Erro ao criar as barbearias:", error);
  }
}

seedDatabase();