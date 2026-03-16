
-- Insert new perfume ٤٢٤
INSERT INTO public.perfumes (name, notes, description, image, price, price_value)
VALUES (
  '٤٢٤',
  'Amber, Oud, Cashmere',
  '٤٢٤ starts off with a slight warm and spicy nutmeg scent and then the middle note is carried forward by a fresh violet flower and then the most interesting part of a perfume is the base note which is Amber, oud and cashmere',
  'https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume1//1stpic.jpg',
  'AED 100',
  100.00
);

-- Insert classification data for ٤٢٤
INSERT INTO public.perfume_classifications (perfume_id, type_floral, type_fresh, type_oriental, type_woody, audience_masculine, audience_feminine, audience_classic, occasion_daily, occasion_sport, occasion_leisure, occasion_night_out, occasion_business, occasion_evening, season_spring, season_summer, season_fall, season_winter)
SELECT id, 65, 40, 65, 60, 50, 60, 50, 45, 45, 45, 45, 45, 45, 65, 65, 65, 65
FROM public.perfumes WHERE name = '٤٢٤';

-- Insert inventory for ٤٢٤
INSERT INTO public.inventory (perfume_id, stock_quantity, low_stock_threshold)
SELECT id, 100, 5
FROM public.perfumes WHERE name = '٤٢٤';

-- Insert perfume images for ٤٢٤ (using same images as placeholder - update later)
INSERT INTO public.perfume_images (perfume_id, image_url, alt_text, is_primary, display_order)
SELECT id, 'https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/perfume1//1stpic.jpg', '٤٢٤ Perfume - Main Image', true, 1
FROM public.perfumes WHERE name = '٤٢٤';
