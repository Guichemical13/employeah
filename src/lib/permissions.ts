import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Permissões padrão por role (baseado na matriz de permissões do sistema)
export const DEFAULT_PERMISSIONS = {
  COLLABORATOR: {
    // Atualizações
    view_personal_updates: true,           // Atualizações pessoais
    view_company_updates: true,             // Atualizações da empresa
    
    // Elogios
    view_team_wall: true,                   // Visualizar mural de elogios
    send_compliment: true,                  // Enviar elogio
    like_compliment_sent_by_self: true,     // Apagar elogio enviado por si
    like_compliment_sent_by_others: false,  // Apagar elogio enviado por terceiro
    
    // Loja
    view_store: true,                       // Visualizar Loja
    add_items_to_cart: true,                // Adicionar itens no carrinho próprio
    remove_items_from_cart: true,           // Apagar itens no carrinho próprio
    insert_new_items_catalog: false,        // Inserir novos itens no catálogo
    remove_items_catalog: false,            // Remover itens do catálogo
    
    // Gestão
    view_users_menu: false,                 // Visualizar menu de Usuários
    transfer_remove_users: false,           // Inserir/remover usuários
    
    // Analytics
    view_analytics: true,                   // Visualizar menu Analytics
    view_own_team_analytics: true,          // Analytics - dados próprios
    view_other_teams_analytics: false,      // Analytics - dados do mesmo time
    
    // Sistema
    view_system_surveys: false,             // Ver Surveys sobre o sistema
    respond_system_surveys: true,           // Responder Surveys sobre o sistema
    configure_own_profile: true,            // Configurar seu próprio perfil
  },
  SUPERVISOR: {
    // Atualizações
    view_personal_updates: true,            // Atualizações pessoais
    view_company_updates: true,             // Atualizações da empresa
    
    // Elogios
    view_team_wall: true,                   // Visualizar mural de elogios
    send_compliment: true,                  // Enviar elogio
    like_compliment_sent_by_self: true,     // Apagar elogio enviado por si
    like_compliment_sent_by_others: true,   // Apagar elogio enviado por terceiro
    
    // Loja
    view_store: true,                       // Visualizar Loja
    add_items_to_cart: true,                // Adicionar itens no carrinho próprio
    remove_items_from_cart: true,           // Apagar itens no carrinho próprio
    insert_new_items_catalog: false,        // Inserir novos itens no catálogo
    remove_items_catalog: false,            // Remover itens do catálogo
    
    // Gestão
    view_users_menu: true,                  // Visualizar menu de Usuários
    transfer_remove_users: false,           // Inserir/remover usuários
    
    // Analytics
    view_analytics: true,                   // Visualizar menu Analytics
    view_own_team_analytics: true,          // Analytics - dados próprios
    view_other_teams_analytics: true,       // Analytics - dados do mesmo time
    
    // Sistema
    view_system_surveys: false,             // Ver Surveys sobre o sistema
    respond_system_surveys: true,           // Responder Surveys sobre o sistema
    configure_own_profile: true,            // Configurar seu próprio perfil
  },
  COMPANY_ADMIN: {
    // Atualizações
    view_personal_updates: true,            // Atualizações pessoais
    view_company_updates: true,             // Atualizações da empresa
    
    // Elogios
    view_team_wall: true,                   // Visualizar mural de elogios
    send_compliment: true,                  // Enviar elogio
    like_compliment_sent_by_self: true,     // Apagar elogio enviado por si
    like_compliment_sent_by_others: true,   // Apagar elogio enviado por terceiro
    
    // Loja
    view_store: true,                       // Visualizar Loja
    add_items_to_cart: true,                // Adicionar itens no carrinho próprio
    remove_items_from_cart: true,           // Apagar itens no carrinho próprio
    insert_new_items_catalog: true,         // Inserir novos itens no catálogo
    remove_items_catalog: true,             // Remover itens do catálogo
    
    // Gestão
    view_users_menu: true,                  // Visualizar menu de Usuários
    transfer_remove_users: true,            // Inserir/remover usuários
    
    // Analytics
    view_analytics: true,                   // Visualizar menu Analytics
    view_own_team_analytics: true,          // Analytics - dados próprios
    view_other_teams_analytics: true,       // Analytics - dados de outros times
    
    // Sistema
    view_system_surveys: false,             // Ver Surveys sobre o sistema
    respond_system_surveys: true,           // Responder Surveys sobre o sistema
    configure_own_profile: true,            // Configurar seu próprio perfil
  },
  SUPER_ADMIN: {
    // SUPER_ADMIN tem todas as permissões habilitadas
    view_personal_updates: true,
    view_company_updates: true,
    view_team_wall: true,
    send_compliment: false,                 // Super Admin não envia elogios
    like_compliment_sent_by_self: false,    // Super Admin não apaga elogios próprios
    like_compliment_sent_by_others: true,   // Super Admin pode moderar elogios de terceiros
    view_store: false,                      // Super Admin não visualiza loja
    add_items_to_cart: false,               // Super Admin não adiciona ao carrinho
    remove_items_from_cart: false,          // Super Admin não remove do carrinho
    insert_new_items_catalog: false,        // Super Admin não insere itens
    remove_items_catalog: false,            // Super Admin não remove itens
    view_users_menu: true,                  // Visualizar menu de Usuários
    transfer_remove_users: true,            // Inserir/remover usuários
    view_analytics: true,                   // Visualizar menu Analytics
    view_own_team_analytics: false,         // Super Admin não tem analytics próprios
    view_other_teams_analytics: false,      // Super Admin não vê analytics de times
    view_system_surveys: true,              // Ver Surveys sobre o sistema
    respond_system_surveys: false,          // Super Admin não responde surveys
    configure_own_profile: true,            // Configurar seu próprio perfil
  },
};

export type PermissionKey = keyof typeof DEFAULT_PERMISSIONS.COLLABORATOR;

/**
 * Verifica se um usuário tem uma permissão específica
 * Primeiro verifica permissões customizadas, depois permissões padrão da role
 */
export async function hasPermission(
  userId: number,
  userRole: string,
  permission: PermissionKey
): Promise<boolean> {
  // Buscar permissão customizada
  const customPermission = await prisma.userPermission.findUnique({
    where: {
      userId_permission: {
        userId,
        permission,
      },
    },
  });

  // Se existe permissão customizada, retornar seu valor
  if (customPermission !== null) {
    return customPermission.value;
  }

  // Caso contrário, retornar permissão padrão da role
  const rolePermissions = DEFAULT_PERMISSIONS[userRole as keyof typeof DEFAULT_PERMISSIONS];
  if (rolePermissions && permission in rolePermissions) {
    return rolePermissions[permission as keyof typeof rolePermissions];
  }

  return false;
}

/**
 * Obter todas as permissões de um usuário (padrão + customizadas)
 */
export async function getUserPermissions(userId: number, userRole: string) {
  const defaultPerms = DEFAULT_PERMISSIONS[userRole as keyof typeof DEFAULT_PERMISSIONS] || {};
  
  const customPerms = await prisma.userPermission.findMany({
    where: { userId },
  });

  const permissions = { ...defaultPerms };
  
  // Sobrescrever com permissões customizadas
  customPerms.forEach((perm) => {
    permissions[perm.permission as keyof typeof permissions] = perm.value;
  });

  return permissions;
}

/**
 * Definir uma permissão customizada para um usuário
 */
export async function setUserPermission(
  userId: number,
  permission: PermissionKey,
  value: boolean
) {
  return await prisma.userPermission.upsert({
    where: {
      userId_permission: {
        userId,
        permission,
      },
    },
    update: { value },
    create: {
      userId,
      permission,
      value,
    },
  });
}

/**
 * Remover permissão customizada (volta ao padrão da role)
 */
export async function removeUserPermission(userId: number, permission: PermissionKey) {
  try {
    await prisma.userPermission.delete({
      where: {
        userId_permission: {
          userId,
          permission,
        },
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verificar se supervisor tem acesso a um time específico
 */
export async function canAccessTeam(supervisorId: number, teamId: number): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      supervisors: {
        some: {
          id: supervisorId,
        },
      },
    },
  });

  return !!team;
}

/**
 * Obter times que o supervisor tem acesso
 */
export async function getSupervisorTeams(supervisorId: number) {
  const user = await prisma.user.findUnique({
    where: { id: supervisorId },
    include: {
      supervisingTeams: {
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              profilePicture: true,
              points: true,
              role: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return user?.supervisingTeams || [];
}
