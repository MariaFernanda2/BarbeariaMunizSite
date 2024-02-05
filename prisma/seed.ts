const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    const images = [
      "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
      "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
    ];

    // Nomes das barbearias
    const creativeNames = [
      "Barbearia Muniz - Centro de Cotia",
      "Barbearia Muniz - Granja Vianna",
      "Barbearia Muniz - São Paulo II",
      "Barbearia Muniz - Alphaville",
      "Barbearia Muniz - Morumbi",
      "Barbearia Muniz - Jardins",
    ];

    // Endereços para as barbearias
    const addresses = [
      "Rua Guido Fecchio, 626",
      "Av. São Camilo, 168",
      "Av. José Giorgi, 698",
      "AL. Rio Negro, 452",
      "Rua Pompeu de Toledo, 456",
      "Avenida Nove de Julho, 598",
    ];

    const services = [
      {
        name: "Corte de Cabelo",
        description: "Estilo personalizado com as últimas tendências.",
        price: 35.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Barba",
        description: "Modelagem completa para destacar sua masculinidade.",
        price: 25.0,
        imageUrl:
          "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Pézinho",
        description: "Acabamento perfeito para um visual renovado.",
        price: 10.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Sobrancelha",
        description: "Expressão acentuada com modelagem precisa.",
        price: 10.0,
        imageUrl:
          "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
      },
      {
        name: "Penteado",
        description: "Acabamento perfeito para seu cabelo.",
        price: 25.0,
        imageUrl:
          "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
      },
      {
        name: "Alisante/Relaxamento",
        description: "Deixe seu cabelo liso e com uma aparência mais natural",
        price: 25.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Pigmentação",
        description: "Acabamento para seu penteado",
        price: 25.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Luzes/Reflexo",
        description: "Luzes e reflexos perfeitos para seu momento",
        price: 60.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Platinado",
        description: "Platinado perfeito para uma mudança de estilo radical",
        price: 150.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Progressiva",
        description: "Cabelo alinhado, hidratado e liso",
        price: 150.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Limpeza simples de pele com hidratação",
        description: "Deixe sua pele limpa e hidratada",
        price: 25.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      
      
    ];

// Criar barbearias com nomes, endereços e imagens fixas
const barbershops = []; // Adicione este array para armazenar as barbearias
for (let i = 0; i < creativeNames.length; i++) {
  const name = creativeNames[i];
  const address = addresses[i];
  const imageUrl = images[i];

  const barbershop = await prisma.barbershop.create({
    data: {
      name,
      address,
      imageUrl: imageUrl,
    },
  });

  for (const service of services) {
    await prisma.service.create({
      data: {
        name: service.name,
        description: service.description,
        price: service.price,
        barbershop: {
          connect: {
            id: barbershop.id,
          },
        },
        imageUrl: service.imageUrl,
      },
    });
  }

  barbershops.push(barbershop); // Adicione cada barbearia ao array
}

// Agora você pode usar o array barbershops conforme necessário


    // Fechar a conexão com o banco de dados
    await prisma.$disconnect();
  } catch (error) {
    console.error("Erro ao criar as barbearias:", error);
  }
}

seedDatabase();
