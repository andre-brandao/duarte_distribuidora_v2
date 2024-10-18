export const permissionsEnum = [
  'receber_fiado',
  'editar_produtos',
  'editar_estoque',
  'ver_relatorios',
  'customer',
  'motoboy',
  'editar_caixas',
  'editar_clientes',
  'atualizar_pedidos'
] as const

type FormatedPermissions = {
  [key in Permission]: string
}

export const formated_Permissions: FormatedPermissions = {
  ver_relatorios: 'Ver Relatórios',
  customer: 'Cliente',
  motoboy: 'Motoboy',
  editar_caixas: 'Editar Caixas',
  editar_clientes: 'Editar Clientes',
  editar_estoque: 'Editar Estoque',
  editar_produtos: 'Editar Produtos',
  receber_fiado: 'Receber Fiado',
    atualizar_pedidos: 'Atualizar Pedidos',
}
export const roleEnum = [
  'admin',
  'employee',
  'customer',
  'motoboy',
  'caixa',
] as const

export type Role = (typeof roleEnum)[number]
export type Permission = (typeof permissionsEnum)[number]