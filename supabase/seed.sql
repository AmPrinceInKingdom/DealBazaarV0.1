-- Minimal starter seed for Deal Bazaar.
insert into public.categories (name, slug, description, image_url)
values
  ('Smart Gadgets', 'smart-gadgets', 'Wearables and electronics', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'),
  ('Home Essentials', 'home-essentials', 'Practical products for daily living', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80'),
  ('Fashion & Lifestyle', 'fashion-lifestyle', 'Modern style and accessories', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80'),
  ('Fitness & Wellness', 'fitness-wellness', 'Health and activity products', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80')
on conflict (slug) do nothing;





chat gpt

-- =========================================================
-- Deal Bazaar Minimal Starter Seed
-- Safe to run after the main schema
-- =========================================================

insert into public.categories (name, slug, description, image_url)
values
  (
    'Smart Gadgets',
    'smart-gadgets',
    'Wearables, accessories, and modern electronics for everyday use.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'Home Essentials',
    'home-essentials',
    'Practical products for daily living and home convenience.',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'Fashion & Lifestyle',
    'fashion-lifestyle',
    'Modern fashion items, accessories, and lifestyle products.',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'Fitness & Wellness',
    'fitness-wellness',
    'Health, fitness, and wellness products for active lifestyles.',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url;