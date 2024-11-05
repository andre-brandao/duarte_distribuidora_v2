import type { PageServerLoad, Actions } from './$types'

import { createTenant } from '$lib/server/db/central/constroller'
import { fail } from '@sveltejs/kit'
import { geocodeAddress } from '$lib/utils/distance'

export const load = (async () => {
  return {}
}) satisfies PageServerLoad

export const actions: Actions = {
  create_tenant: async ({ request }) => {
    try {
    const formData = await request.formData()
    const tenantName = formData.get('tenantName')
    const subdomain = formData.get('subdomain')
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const phone = formData.get('phone')
    const cep = formData.get('cep')
    const street = formData.get('street')
    const neighborhood = formData.get('neighborhood')
    const number = formData.get('number')
    const city = formData.get('city')
    const state = formData.get('state')
    const address = `${street}, ${number}, ${city}, ${neighborhood},  ${state}, ${cep}, BR`
    console.log(formData)
    if (!phone || !cep || !street || !neighborhood || !number || !city || !state) {
      console.error('Campos obrigatórios')
      return fail(400, {
        success: false,
        message: 'Campo obrigatório',
        form: {
          tenantName,
          subdomain,
          name,
          email,
          phone,
          cep,
          street,
          neighborhood,
          number,
          city,
          state,
        },
      });
    }
    if (password !== confirmPassword) {
      console.error('Senhas estão diferentes')
      return fail(400, {
        success: false,
        message: 'Senhas estão diferentes',
        form: {
          tenantName,
          subdomain,
          name,
          email,
          phone,
          cep,
          street,
          neighborhood,
          number,
          city,
          state,
        },
      })
    }
    const location = await geocodeAddress(address);

    const result = await createTenant({
      email,
      password,
      subdomain,
      tenantName,
      name: name,
      phone:phone,
      address,
      lat: location.lat,
      lon: location.lon,
    })
    console.log('test5')
    if (!result.success || !result.data) {
      console.error(result.message)
      return fail(400, {
        success: false,
        message: result.message,
        form: {
          tenantName,
          subdomain,
          name,
          email,
          phone,
          cep,
          street,
          neighborhood,
          number,
          city,
          state,      
        },
      })
    }
    console.log('Distribuidora criada!')
    return {
      success: true,
      message: 'Distribuidora criada!',
      data: result.data,
    }
  } catch (error) {
    console.error("Error processing form data:", error);
  }
  },
}

