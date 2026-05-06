do $$
declare
  prop_id uuid := gen_random_uuid();
begin

insert into properties (
  id, slug, title, description, neighborhood, city, state,
  price, bedrooms_min, bedrooms_max, bathrooms, area_min, area_max,
  parking, is_launch, urgency_text, latitude, longitude
) values (
  prop_id,
  'vibra-rio-bonito-rio-bonito-sao-paulo-sp',
  'Vibra Rio Bonito',
  'O Vibra Rio Bonito é um empreendimento residencial moderno localizado no bairro Rio Bonito, em São Paulo. Com apartamentos de 1 e 2 dormitórios, oferece praticidade e conforto para quem busca qualidade de vida na cidade. Acabamentos de alto padrão, área de lazer completa e localização privilegiada próxima ao metrô.',
  'Rio Bonito', 'São Paulo', 'SP',
  null, 1, 2, 1, 34, 41, 1, true,
  'Últimas unidades disponíveis',
  -23.5505, -46.6333
);

insert into property_images (property_id, url, "order") values
  (prop_id, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', 0),
  (prop_id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', 1),
  (prop_id, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80', 2),
  (prop_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80', 3);

insert into property_floorplans (property_id, url, label) values
  (prop_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', '1 Dormitório — 34 m²'),
  (prop_id, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d38?w=800&q=80', '2 Dormitórios — 41 m²');

insert into property_amenities (property_id, name) values
  (prop_id, 'Portaria 24h'), (prop_id, 'Piscina'), (prop_id, 'Academia'),
  (prop_id, 'Salão de Festas'), (prop_id, 'Playground'), (prop_id, 'Espaço Gourmet'),
  (prop_id, 'Bicicletário'), (prop_id, 'Pet Place');

insert into property_features (property_id, name) values
  (prop_id, 'Varanda em todos os apartamentos'), (prop_id, 'Acabamento premium'),
  (prop_id, 'Área de lazer completa'), (prop_id, 'Próximo ao metrô'),
  (prop_id, 'Infraestrutura para ar-condicionado'), (prop_id, 'Elevador'),
  (prop_id, 'Gerador de energia'), (prop_id, 'Espaço coworking');

insert into property_status (property_id, stage, date) values
  (prop_id, 'Lançamento', '2025-01'),
  (prop_id, 'Obras iniciadas', '2025-06'),
  (prop_id, 'Entrega prevista', '2027-12');

end $$;
