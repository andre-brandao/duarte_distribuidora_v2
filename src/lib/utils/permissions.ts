export const permissionsEnum = [
    'receber_fiado',
    'editar_produtos',
    'editar_estoque',
    'ver_relatorios',
    'customer',
    'motoboy',
    'editar_caixas'
] as const

export const roleEnum = [
    'admin',
    'employee',
    'customer',
    'motoboy',
    'caixa',
] as const

export type Role = (typeof roleEnum)[number]
export type Permission = (typeof permissionsEnum)[number]