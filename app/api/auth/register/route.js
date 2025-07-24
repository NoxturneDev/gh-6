import prisma from "@/app/lib/PrismaClient";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tidak boleh ada field yang kosong" }, { status: 400 });
    }

    const isUserExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isUserExist) {
      return NextResponse.json({ error: "Email ini sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Registrasi berhasil", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Terjadi Kesalahan" }, { status: 500 });
  }
}
