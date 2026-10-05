const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // Categories
  const cats = [
    { name: "Iuran Bulanan", type: "pemasukan" },
    { name: "Denda", type: "pemasukan" },
    { name: "Donasi", type: "pemasukan" },
    { name: "Snack & Minuman", type: "pengeluaran" },
    { name: "Sewa Tempat", type: "pengeluaran" },
    { name: "Perlengkapan", type: "pengeluaran" },
  ];
  for (const c of cats) {
    const exists = await prisma.category.findFirst({ where: { name: c.name } });
    if (!exists) await prisma.category.create({ data: c });
  }

  // Admin
  const adminEmail = "admin@kaskita.id";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: "Administrator",
        username: "admin",
        email: adminEmail,
        phone: "081234567890",
        passwordHash: await bcrypt.hash("admin123", 10),
        role: "admin",
      },
    });
  }

  // Demo members
  const members = [
    { name: "Budi Santoso", username: "budi", email: "budi@kaskita.id", phone: "081111111111" },
    { name: "Siti Aminah", username: "siti", email: "siti@kaskita.id", phone: "082222222222" },
    { name: "Andi Wijaya", username: "andi", email: "andi@kaskita.id", phone: "083333333333" },
  ];
  for (const m of members) {
    const exists = await prisma.user.findUnique({ where: { email: m.email } });
    if (!exists) {
      await prisma.user.create({
        data: { ...m, passwordHash: await bcrypt.hash("member123", 10), role: "member" },
      });
    }
  }

  // Settings singleton
  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", organizationName: "Kantin Samping Organisasi", cashAmount: 50000 },
  });

  console.log("Seed selesai. Admin: admin@kaskita.id / admin123, Member: budi@kaskita.id / member123");
}

main().finally(() => prisma.$disconnect());
