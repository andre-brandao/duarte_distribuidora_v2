import type { RequestHandler } from './$types'

import { image, bugReport } from '$db/controller'

export const GET: RequestHandler = async ({ params, locals: { tenantDb } }) => {
  const id = Number(params.id)

  if (!id) {
    return new Response('Not found', { status: 404 })
  }

  const [{ img }] = await image(tenantDb!).getImageByID(id)

  if (!img) {
    return new Response('Not found', { status: 404 })
  }
  // get image
  return new Response(img, {
    headers: {
      'Content-Type': 'image/jpeg',
    },
  })
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user, tenantDb } = locals

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const formData = await request.formData()
    const name = formData.get('name')
    const imageFile = formData.get('image')

    if (typeof name !== 'string' || !(imageFile instanceof File)) {
      return new Response('Invalid form data', { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())

    const [{ img_id }] = await image(tenantDb!).insertImage({
      buff: imageBuffer,
      name,
      uploaded_by: user.id,
    })

    await bugReport(tenantDb!).insertLogs({
      text: `User ${user.username} uploaded image ${img_id}`,
      type: 'LOG',
      created_by: user.id,
      routeName: 'Inserir Imagem',
      pathname: '/api/image',
    })
    return new Response(JSON.stringify({ img_id }), {
      status: 200,
    })
  } catch (error) {
    console.error('Error creating image: ', error)
    return new Response('Error creating image', { status: 500 })
  }
}
