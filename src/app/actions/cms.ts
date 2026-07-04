"use server";

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

// Using a local file for the CMS backend since Supabase is not configured.
// This is perfect for local development. If deployed to Vercel, this will be read-only 
// (unless using a persistent volume or edge store), but it fulfills the local CMS requirement.
const CMS_FILE_PATH = path.join(process.cwd(), 'data', 'cms.json');

export async function getCMSData() {
  try {
    const data = await fs.readFile(CMS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading CMS data:", error);
    return { content: {}, products: [] };
  }
}

export async function updateCMSContent(section: string, data: any) {
  try {
    const currentData = await getCMSData();
    currentData.content[section] = { ...currentData.content[section], ...data };
    await fs.writeFile(CMS_FILE_PATH, JSON.stringify(currentData, null, 2));
    revalidatePath('/'); // Force Next.js to re-render pages with new data
    return { success: true };
  } catch (error) {
    console.error("Error updating CMS content:", error);
    return { success: false, error: "Failed to update content" };
  }
}

export async function updateProduct(productId: string, data: any) {
  try {
    const currentData = await getCMSData();
    const productIndex = currentData.products.findIndex((p: any) => p.id === productId);
    
    if (productIndex >= 0) {
      currentData.products[productIndex] = { ...currentData.products[productIndex], ...data };
    } else {
      currentData.products.push({ id: productId, ...data });
    }
    
    await fs.writeFile(CMS_FILE_PATH, JSON.stringify(currentData, null, 2));
    revalidatePath('/collections/all');
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const currentData = await getCMSData();
    currentData.products = currentData.products.filter((p: any) => p.id !== productId);
    
    await fs.writeFile(CMS_FILE_PATH, JSON.stringify(currentData, null, 2));
    revalidatePath('/collections/all');
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
