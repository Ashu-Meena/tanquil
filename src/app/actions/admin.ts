"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Validates that the current user is an admin.
 * Throws an error if not.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role')
    .eq('id', user.id)
    .single();

  if (!profile || (!profile.is_admin && profile.role !== 'super_admin')) {
    throw new Error("Unauthorized: Admin privileges required");
  }

  return supabase;
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteReview(id: string) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete review:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw error;
    
    revalidatePath("/admin/discounts");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete coupon:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePaymentStatus(id: string, payment_status: string) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("orders").update({ payment_status }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOrderFulfillment(id: string, data: { notes: string, tracking_id: string, courier_name: string }) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("orders").update(data).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateOrderStatus(ids: string[], status: string) {
  try {
    const supabase = await requireAdmin();
    await Promise.all(ids.map(id => supabase.from("orders").update({ status }).eq("id", id)));
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
