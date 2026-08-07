import { clearAuthCookies } from "@/lib/auth-cookie";
import { NextResponse } from "next/server";

export async function POST(){

    const response = NextResponse.json(
        {
        success:true,
        message:"Logout successfully"
        },
        {
        status:200
       });

    clearAuthCookies(response);

}