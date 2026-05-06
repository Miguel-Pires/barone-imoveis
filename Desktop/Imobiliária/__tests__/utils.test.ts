import { formatPrice, generateSlug, formatPhone } from '@/lib/utils'

describe('formatPrice', () => {
  it('returns "Sob consulta" for null', () => {
    expect(formatPrice(null)).toBe('Sob consulta')
  })
  it('formats BRL currency without decimals', () => {
    const result = formatPrice(350000)
    expect(result).toContain('350')
    expect(result).toContain('R$')
  })
})

describe('generateSlug', () => {
  it('generates URL-safe slug from multiple parts', () => {
    expect(generateSlug('Vibra Rio Bonito', 'Rio Bonito', 'São Paulo', 'SP'))
      .toBe('vibra-rio-bonito-rio-bonito-sao-paulo-sp')
  })
  it('strips accents', () => {
    expect(generateSlug('Imóvel Único')).toBe('imovel-unico')
  })
  it('collapses multiple spaces and hyphens', () => {
    expect(generateSlug('hello   world')).toBe('hello-world')
  })
})

describe('formatPhone', () => {
  it('formats 11-digit mobile phone', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })
  it('handles partial input without crashing', () => {
    expect(formatPhone('11')).toBe('11')
    expect(formatPhone('119')).toBe('(11) 9')
  })
  it('strips non-digits before formatting', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
  })
})
