import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user ID
 * @param folder - The folder path (e.g., 'receipts', 'invoices')
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  userId: string,
  folder: string = 'receipts'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('finance-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('finance-attachments')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (err) {
    console.error('Unexpected error uploading file:', err);
    return { url: null, error: 'Failed to upload file' };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl - The public URL of the file to delete
 * @returns Success status and error message if any
 */
export async function deleteFile(
  fileUrl: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const bucketName = pathParts[pathParts.length - 3];
    const filePath = pathParts.slice(-2).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting file:', err);
    return { success: false, error: 'Failed to delete file' };
  }
}

/**
 * Create an attachment record in the database
 * @param userId - The user ID
 * @param transactionType - Type of transaction ('income', 'expense', 'zakat', 'transfer')
 * @param transactionId - The transaction ID
 * @param fileUrl - The public URL of the file
 * @param fileName - Original file name
 * @param fileSize - File size in bytes
 * @param mimeType - MIME type of the file
 * @returns The created attachment record or error
 */
export async function createAttachment(
  userId: string,
  transactionType: 'income' | 'expense' | 'zakat' | 'transfer',
  transactionId: string,
  fileUrl: string,
  fileName: string,
  fileSize?: number,
  mimeType?: string
): Promise<{ data: any | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        transaction_id: transactionId,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize || null,
        mime_type: mimeType || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating attachment:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error creating attachment:', err);
    return { data: null, error: 'Failed to create attachment record' };
  }
}

