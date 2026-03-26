import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: "medlem1", name: "Medlem 1", password: "password123" },
    { username: "medlem2", name: "Medlem 2", password: "password123" },
    { username: "medlem3", name: "Medlem 3", password: "password123" },
    { username: "medlem4", name: "Medlem 4", password: "password123" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        name: user.name,
        passwordHash: hashSync(user.password, 10),
      },
    });
  }

  console.log("Seeded 4 users (password: password123)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
