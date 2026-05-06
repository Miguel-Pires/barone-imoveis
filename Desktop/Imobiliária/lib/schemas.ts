import { z } from 'zod'

export const leadSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().optional(),
  phone: z
    .string()
    .min(14, 'Telefone inválido')
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  interest: z.string().min(1, 'Selecione um interesse'),
})

export type LeadInput = z.infer<typeof leadSchema>

export const propertySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().nullable().optional().default(null),
  neighborhood: z.string().nullable().optional().default(null),
  city: z.string().nullable().optional().default(null),
  state: z.string().nullable().optional().default(null),
  price: z.number().nullable().optional().default(null),
  bedrooms_min: z.number().int().min(0),
  bedrooms_max: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area_min: z.number().min(0),
  area_max: z.number().min(0),
  parking: z.number().int().min(0),
  latitude: z.number().nullable().optional().default(null),
  longitude: z.number().nullable().optional().default(null),
  is_launch: z.boolean().default(false),
  urgency_text: z.string().nullable().optional().default(null),
})

export type PropertyInput = z.infer<typeof propertySchema>
