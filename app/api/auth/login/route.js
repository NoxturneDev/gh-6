import prisma from "@/app/lib/PrismaClient";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ error: "Passoword Salah" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login Berhasil",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, {status: 200})

  } catch (err) {
    console.log(err);
    NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
