import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendOrderConfirmationEmails } from "@/lib/orders/confirmation";
const schema = z.object({ customerName:z.string().trim().min(2).max(120), customerEmail:z.string().trim().email().max(254), customerPhone:z.string().trim().min(7).max(30), address:z.string().trim().min(5).max(300), city:z.string().trim().min(2).max(100), state:z.string().trim().min(2).max(100), notes:z.string().max(500).optional() });
export async function POST(request: Request) {
  const token=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]; const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!token||!url||!key)return NextResponse.json({message:"Sign in again to continue."},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({message:"Check your delivery details and try again."},{status:400});
  const supabase=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
  const{data:{user},error:authError}=await supabase.auth.getUser(token); if(authError||!user)return NextResponse.json({message:"Your session expired. Sign in again."},{status:401});
  const d=parsed.data; const{data,error}=await supabase.rpc("create_order_from_cart",{p_customer_name:d.customerName,p_customer_email:d.customerEmail.toLowerCase(),p_customer_phone:d.customerPhone,p_delivery_address:d.address,p_delivery_city:d.city,p_delivery_state:d.state,p_delivery_notes:d.notes??""});
  if(error){const known=["delivery_fee_not_configured","empty_cart","insufficient_stock","product_unavailable","variant_unavailable","invalid_customer_details","invalid_delivery_details"];const reason=known.find((code)=>error.message.includes(code));console.error("Native checkout failed:",{code:error.code,reason:reason??"checkout_failed"});const message=reason==="empty_cart"?"Your cart is empty.":reason==="insufficient_stock"||reason==="product_unavailable"||reason==="variant_unavailable"?"A product's availability changed. Review your cart and try again.":reason==="delivery_fee_not_configured"?"Checkout is not available right now.":"Your order could not be placed. Please try again.";return NextResponse.json({message},{status:400});}
  const order=Array.isArray(data)?data[0]:data;if(!order?.id||!order.order_number)return NextResponse.json({message:"Your order could not be confirmed."},{status:500});
  const emailSent=await sendOrderConfirmationEmails(supabase,user.id,order,d);
  return NextResponse.json({...order,email_sent:emailSent});
}
