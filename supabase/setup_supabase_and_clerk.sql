-- Official product seed only. Apply timestamped Supabase migrations first.
-- Re-running this file updates the six official products and variants by slug/SKU.

-- =============================================================================
-- SEED OFFICIAL FYNNESTLADY PRODUCTS (PRODUCTS 1–6)
-- =============================================================================

-- Product 1: Eden Bliss Deluxe Soap (500 ml — GH₵400)
with p1 as (
  insert into public.products (slug, name, category, concerns, skin_types, image_url, badge, stock_status, description, benefits, key_ingredients, how_to_use, warnings, delivery, is_fixture, status)
  values (
    'eden-bliss-deluxe-soap',
    'Eden Bliss Deluxe Soap',
    'Body Care',
    array['uneven-tone', 'dark-spots', 'radiance'],
    array['all'],
    '/images/products/product-1.jpeg',
    'bestseller',
    'in-stock',
    'Experience a unique blend of herbal-inspired skincare ingredients with Eden Bliss Deluxe Soap. Formulated with kojic acid, licorice, honey, rose water, carrot extract, sandalwood powder, and vitamins, this blend is designed for complexion-focused body care. Your skin deserves the Fynnest care.',
    array['Helps improve the appearance of uneven skin tone.', 'Targets the appearance of body spots.', 'Supports smoother-looking skin.'],
    array['Kojic acid', 'Licorice', 'Honey', 'Rose water', 'Carrot extract', 'Sandalwood powder', 'Vitamins'],
    array['Lather a small amount onto damp skin during your bath or shower.', 'Massage gently across the body, focusing on areas of uneven tone.', 'Rinse thoroughly with warm water and follow with a nourishing moisturiser.'],
    'For external use only. Avoid direct contact with eyes.',
    'Available for nationwide delivery across Ghana.',
    false,
    'active'
  )
  on conflict (slug) do update set
    name = excluded.name,
    image_url = excluded.image_url,
    description = excluded.description,
    is_fixture = false,
    status = 'active'
  returning id
)
insert into public.product_variants (product_id, sku, name, size, price_minor, stock, currency, status)
select id, 'FL-EBS-500', 'Eden Bliss Deluxe Soap — 500 ml', '500 ml', 40000, 25, 'GHS', 'active' from p1
on conflict (sku) do update set price_minor = 40000, stock = 25, status = 'active';

-- Product 2: Blosom Face Lightening Milk (50 ml — GH₵280 | 100 ml — GH₵320)
with p2 as (
  insert into public.products (slug, name, category, concerns, skin_types, image_url, badge, stock_status, description, benefits, key_ingredients, how_to_use, warnings, delivery, is_fixture, status)
  values (
    'blosom-face-lightening-milk',
    'Blosom Face Lightening Milk',
    'Moisturisers',
    array['dark-spots', 'uneven-tone', 'radiance'],
    array['all', 'dry', 'combination'],
    '/images/products/product-2.jpeg',
    'bestseller',
    'in-stock',
    'Give your skincare routine a boost with Blosom Face Lightening Milk, formulated with Vitamin E and grapeseed oil to complement your facial skincare routine. Your glow deserves specialised care.',
    array['Helps improve the appearance of dark spots and uneven skin tone.', 'Supports smoother, firmer-looking skin.', 'Helps nourish the skin and improve its appearance.', 'Designed for complexion care and mature-looking skin.'],
    array['Vitamin E', 'Grapeseed oil'],
    array['Apply a small amount to clean, dry facial skin.', 'Gently massage until fully absorbed.', 'Use consistently and pair with broad-spectrum sunscreen during the day.'],
    'For external use only. Patch test before first use.',
    'Available for nationwide delivery across Ghana.',
    false,
    'active'
  )
  on conflict (slug) do update set
    name = excluded.name,
    image_url = excluded.image_url,
    description = excluded.description,
    is_fixture = false,
    status = 'active'
  returning id
)
insert into public.product_variants (product_id, sku, name, size, price_minor, stock, currency, status)
select id, 'FL-BLM-50', 'Blosom Face Lightening Milk — 50 ml', '50 ml', 28000, 20, 'GHS', 'active' from p2
union all
select id, 'FL-BLM-100', 'Blosom Face Lightening Milk — 100 ml', '100 ml', 32000, 20, 'GHS', 'active' from p2
on conflict (sku) do update set price_minor = excluded.price_minor, stock = excluded.stock, status = 'active';

-- Product 3: Glitzer Face Scrub (200 ml — GH₵300)
with p3 as (
  insert into public.products (slug, name, category, concerns, skin_types, image_url, badge, stock_status, description, benefits, key_ingredients, how_to_use, warnings, delivery, is_fixture, status)
  values (
    'glitzer-face-scrub',
    'Glitzer Face Scrub',
    'Cleansers',
    array['radiance', 'uneven-tone', 'everyday'],
    array['all', 'oily', 'combination', 'dry'],
    '/images/products/product-3.jpeg',
    'new',
    'in-stock',
    'Reveal a fresher-looking glow with Glitzer Face Scrub. Formulated with oats and essential oils, this exfoliating scrub helps remove surface impurities and dead skin cells, leaving your skin feeling smoother, softer, and refreshed. Reveal your glow. Experience the Fynnest Effect.',
    array['Gently exfoliates the skin.', 'Helps improve the appearance of dull skin.', 'Leaves skin feeling soft, smooth, and refreshed.'],
    array['Oats', 'Essential oils'],
    array['Apply to damp facial skin and massage gently in circular motions.', 'Avoid the delicate eye area.', 'Rinse thoroughly with lukewarm water and follow with toner and moisturiser.'],
    'For external use only. Do not use on broken or irritated skin.',
    'Available for nationwide delivery across Ghana.',
    false,
    'active'
  )
  on conflict (slug) do update set
    name = excluded.name,
    image_url = excluded.image_url,
    description = excluded.description,
    is_fixture = false,
    status = 'active'
  returning id
)
insert into public.product_variants (product_id, sku, name, size, price_minor, stock, currency, status)
select id, 'FL-GFS-200', 'Glitzer Face Scrub — 200 ml', '200 ml', 30000, 20, 'GHS', 'active' from p3
on conflict (sku) do update set price_minor = 30000, stock = 20, status = 'active';

-- Product 4: Nova Gold Face Cream (50 g — GH₵280)
with p4 as (
  insert into public.products (slug, name, category, concerns, skin_types, image_url, badge, stock_status, description, benefits, key_ingredients, how_to_use, warnings, delivery, is_fixture, status)
  values (
    'nova-gold-face-cream',
    'Nova Gold Face Cream',
    'Moisturisers',
    array['uneven-tone', 'dark-spots', 'radiance'],
    array['all', 'dry', 'combination'],
    '/images/products/product-4.jpeg',
    'new',
    'in-stock',
    'Pure & Elegant Beauty. Helps improve the appearance of fine lines, sun damage, and uneven skin tone for a smoother, more radiant-looking complexion. Reveal Your Radiance. Experience the Fynnest Effect.',
    array['Helps improve the appearance of fine lines.', 'Targets the appearance of sun damage and uneven skin tone.', 'Supports a smoother, more radiant-looking complexion.'],
    array['Complexion-nourishing botanicals & emollients'],
    array['Apply evenly to a cleansed face and neck.', 'Massage gently in upward strokes until absorbed.', 'Use daily sunscreen during daytime routines.'],
    'For external use only. Avoid contact with eyes.',
    'Available for nationwide delivery across Ghana.',
    false,
    'active'
  )
  on conflict (slug) do update set
    name = excluded.name,
    image_url = excluded.image_url,
    description = excluded.description,
    is_fixture = false,
    status = 'active'
  returning id
)
insert into public.product_variants (product_id, sku, name, size, price_minor, stock, currency, status)
select id, 'FL-NGC-50G', 'Nova Gold Face Cream — 50 g', '50 g', 28000, 20, 'GHS', 'active' from p4
on conflict (sku) do update set price_minor = 28000, stock = 20, status = 'active';

-- Product 5: Revive Essence Toner (100 ml — GH₵250)
with p5 as (
  insert into public.products (slug, name, category, concerns, skin_types, image_url, badge, stock_status, description, benefits, key_ingredients, how_to_use, warnings, delivery, is_fixture, status)
  values (
    'revive-essence-toner',
    'Revive Essence Toner',
    'Treatments',
    array['acne-breakouts', 'blemishes', 'everyday'],
    array['oily', 'combination', 'sensitive', 'all'],
    '/images/products/product-5.jpeg',
    null,
    'in-stock',
    'Refresh • Soothe • Clarify. Formulated with witch hazel and carrot herbs to refresh the skin and support a clearer-looking complexion.',
    array['Helps remove excess surface oil and refresh the skin.', 'Designed for mild blemish-prone skin.', 'Helps soothe the feeling of skin discomfort.'],
    array['Witch hazel', 'Carrot herbs'],
    array['After cleansing, apply to a cotton pad or directly into clean palms.', 'Gently sweep or pat across the face and neck, avoiding the eyes.', 'Follow with your Fynnestlady treatment or moisturiser.'],
    'For external use only. Avoid direct contact with eyes.',
    'Available for nationwide delivery across Ghana.',
    false,
    'active'
  )
  on conflict (slug) do update set
    name = excluded.name,
    image_url = excluded.image_url,
    description = excluded.description,
    is_fixture = false,
    status = 'active'
  returning id
)
insert into public.product_variants (product_id, sku, name, size, price_minor, stock, currency, status)
select id, 'FL-RET-100', 'Revive Essence Toner — 100 ml', '100 ml', 25000, 25, 'GHS', 'active' from p5
on conflict (sku) do update set price_minor = 25000, stock = 25, status = 'active';

-- Product 6: Fruity Pebbles Exfoliating Scrub (250 g — GH₵200)
with p6 as (
  insert into public.products (slug, name, category, concerns, skin_types, image_url, badge, stock_status, description, benefits, key_ingredients, how_to_use, warnings, delivery, is_fixture, status)
  values (
    'fruity-pebbles-exfoliating-scrub',
    'Fruity Pebbles Exfoliating Scrub',
    'Body Care',
    array['uneven-tone', 'dark-spots', 'radiance'],
    array['all'],
    '/images/products/product-6.jpeg',
    'bestseller',
    'in-stock',
    'Deep Exfoliation • Complexion Care. Designed to deeply exfoliate the skin and improve the appearance of pigmentation and discolouration, leaving your skin feeling smoother and refreshed.',
    array['Helps remove dead skin cells.', 'Targets the appearance of uneven skin tone.', 'Supports smoother, brighter-looking skin.'],
    array['Botanical fruit & therapeutic exfoliating blend'],
    array['After shower, wash lather off skin, then scoop a desirable quantity in your hands.', 'Gently scrub your body, concentrating on darker areas, inner thigh, pigment, knuckles, feet, and hands for a few minutes, then rinse with water.', 'Tap dry, then moisturise right after.'],
    'For external use only. Keep in a cool, dry place. Avoid direct sunlight.',
    'Available for nationwide delivery across Ghana.',
    false,
    'active'
  )
  on conflict (slug) do update set
    name = excluded.name,
    image_url = excluded.image_url,
    description = excluded.description,
    is_fixture = false,
    status = 'active'
  returning id
)
insert into public.product_variants (product_id, sku, name, size, price_minor, stock, currency, status)
select id, 'FL-FPS-250G', 'Fruity Pebbles Exfoliating Scrub — 250 g', '250 g', 20000, 30, 'GHS', 'active' from p6
on conflict (sku) do update set price_minor = 20000, stock = 30, status = 'active';
