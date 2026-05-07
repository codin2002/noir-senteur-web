UPDATE public.perfume_images SET image_url='https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume2/IMG_6543.JPG.jpeg', alt_text='٤٢٤ Perfume - Image 1', display_order=1, is_primary=true WHERE id='d6fc8df9-fbc0-4c29-8901-267124bc8305';

INSERT INTO public.perfume_images (perfume_id, image_url, display_order, alt_text, is_primary)
VALUES ('37b4d1ef-6589-4852-a74d-c4a10bc04302','https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume2/IMG_6544.JPG.jpeg',2,'٤٢٤ Perfume - Image 2',false)
ON CONFLICT DO NOTHING;

UPDATE public.perfumes SET image='https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume2/IMG_6543.JPG.jpeg' WHERE id='37b4d1ef-6589-4852-a74d-c4a10bc04302';