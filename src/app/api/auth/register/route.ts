import { userController } from "@/lib/controllers/userController";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, phone, password } = await req.json();

    if (!username || !phone || !password) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    const result = await userController.register(username, phone, password);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Đăng ký thành công' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
