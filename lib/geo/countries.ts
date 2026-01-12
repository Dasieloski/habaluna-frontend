export type CountryName = string

export const COUNTRY_TO_MUNICIPALITIES: Record<CountryName, string[]> = {
  Cuba: [
    "Playa",
    "Plaza de la Revolución",
    "Centro Habana",
    "Habana Vieja",
    "Regla",
    "Habana del Este",
    "Guanabacoa",
    "San Miguel del Padrón",
    "Diez de Octubre",
    "Cerro",
    "Marianao",
    "La Lisa",
    "Boyeros",
    "Arroyo Naranjo",
    "Cotorro",
  ],
  España: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga"],
  México: ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana"],
  "Estados Unidos": ["Miami", "New York", "Los Angeles", "Chicago", "Houston"],
}

export const COUNTRIES: CountryName[] = [
  "Cuba",
  ...Object.keys(COUNTRY_TO_MUNICIPALITIES).filter((c) => c !== "Cuba").sort(),
]

export function getMunicipalitiesByCountry(country: CountryName | undefined | null): string[] {
  if (!country) return COUNTRY_TO_MUNICIPALITIES.Cuba
  return COUNTRY_TO_MUNICIPALITIES[country] || []
}

