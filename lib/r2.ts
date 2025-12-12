import { supabase } from './supabase';

export const r2Storage = {
    /**
     * Uploads a file to R2 via Supabase Edge Function (Secure)
     * @param bucketName 'photos' or 'chat-media'
     * @param path File path (e.g., 'user_id/filename.jpg')
     * @param file File object
     * @returns Public URL of the uploaded file
     */
    uploadFile: async (bucketName: string, path: string, file: File): Promise<{ url: string | null; error: any }> => {
        try {
            console.log('Solicitando URL assinada para:', path);

            // 0. Ensure User is Authenticated
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Usuário não autenticado (Sessão inválida)');
            }

            // 1. Ask Edge Function for a Signed URL (passing token explicitly)
            const { data, error: fnError } = await supabase.functions.invoke('upload-r2', {
                body: {
                    bucket: bucketName,
                    path: path,
                    method: 'PUT',
                    contentType: file.type
                },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (fnError) {
                console.error('Erro na Edge Function:', fnError);
                throw fnError;
            }

            if (!data?.url) {
                throw new Error('Falha ao gerar URL de upload (URL vazia retornada)');
            }

            console.log('URL assinada recebida. Fazendo upload...');

            // 2. Upload to R2 using the Signed URL
            const uploadResponse = await fetch(data.url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadResponse.ok) {
                throw new Error(`Erro no upload para R2: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            console.log('Upload concluído com sucesso!');

            // 3. Construct Public URL based on Bucket
            const publicDomain = bucketName === 'photos'
                ? import.meta.env.VITE_R2_PUBLIC_URL_PHOTOS
                : import.meta.env.VITE_R2_PUBLIC_URL_CHAT;

            const publicUrl = `${publicDomain}/${path}`;

            return { url: publicUrl, error: null };

        } catch (error: any) {
            console.error('R2 Upload Error Details:', error);
            const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            // Alert for visibility during dev/beta
            alert(`Erro no upload: ${msg}`);
            return { url: null, error: msg };
        }
    },

    /**
     * Deletes a file from R2
     * For now, deletion is not implemented in the secure client.
     */
    deleteFile: async (bucketName: string, path: string) => {
        console.warn('Delete not implemented via Edge Function yet.');
        return { error: null };
    },

    /**
     * Generate a Public URL for a given path
     * Now requires knowing the bucket to choose the correct domain
     */
    getPublicUrl: (path: string, bucketName: 'photos' | 'chat-media' = 'photos') => {
        if (!path) return '';
        if (path.startsWith('http')) return path;

        const domain = bucketName === 'photos'
            ? import.meta.env.VITE_R2_PUBLIC_URL_PHOTOS
            : import.meta.env.VITE_R2_PUBLIC_URL_CHAT;

        return `${domain}/${path}`;
    }
};
