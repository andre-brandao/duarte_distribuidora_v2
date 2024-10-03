import { GOOGLE_MAPS_KEY } from '$env/static/private'
import { Client } from '@googlemaps/google-maps-services-js'

const maps_client = new Client({})

export async function geocodeAddress(address: string) {
  console.log('Geocodificando' + address)
  try {
    const result = await maps_client.geocode({
      params: {
        address: address,
        key: GOOGLE_MAPS_KEY,
      },
    })

    const location = result.data.results[0]?.geometry.location
    return location
  } catch (e) {
    console.error(e)
    console.warn(`Erro ao geocodificar o endereço: ${address}`)
  }
}

export function getDistanceFromLatLonInKm(
  position1: { lat: number; lon: number },
  position2: { lat: number; lon: number },
) {
  const deg2rad = (deg: number) => {
      return deg * (Math.PI / 180)
    },
    R = 6371,
    dLat = deg2rad(position2.lat - position1.lat),
    dLng = deg2rad(position2.lon - position1.lon),
    a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(position1.lat)) *
        Math.cos(deg2rad(position1.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000
}