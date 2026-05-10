import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing name, email, or password" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const supabase = getServiceSupabase();


    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }


    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);


    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash,
        name,
        role: "USER" 
      })
      .select()
      .single();

    if (insertError || !newUser) {
      console.error("Insert User Error:", insertError);
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }


    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as "ADMIN" | "USER"
    });

    const response = NextResponse.json({
      message: "Registered and logged in successfully",
      user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }
    });


    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
