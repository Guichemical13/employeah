import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Permissões padrão por role
export const DEFAULT_PERMISSIONS = {
  SUPERVISOR: {
    // Visualizações pessoais
    view_personal_updates: true,
    view_company_updates: true,
    view_team_wall: true,
    send_compliment: true,
    like_compliment_sent_by_self: true,
    like_compliment_sent_by_others: false,
    view_store: true,
    add_items_to_cart: true,
    remove_items_from_cart: true,
    view_users_menu: false,
    transfer_remove_users: false,
    insert_new_items_catalog: false,
    remove_items_catalog: false,
    view_analytics: true,
    view_own_team_analytics: true,
    view_other_teams_analytics: false,
    view_system_surveys: false,
    configure_own_profile: true,
    respond_system_surveys: true,
  },
  COMPANY_ADMIN: {
    view_personal_updates: true,
    view_company_updates: true,
    view_team_wall: true,
    send_compliment: true,
    like_compliment_sent_by_self: true,
    like_compliment_sent_by_others: true,
    view_store: true,
    add_items_to_cart: true,
    remove_items_from_cart: true,
    view_users_menu: true,
    transfer_remove_users: true,
    insert_new_items_catalog: true,
    remove_items_catalog: true,
    view_analytics: true,
    view_own_team_analytics: true,
    view_other_teams_analytics: true,
    view_system_surveys: false,
    configure_own_profile: true,
    respond_system_surveys: true,
  },
  COLLABORATOR: {
    view_personal_updates: true,
    view_company_updates: true,
    view_team_wall: true,
    send_compliment: true,
    like_compliment_sent_by_self: true,
    like_compliment_sent_by_others: false,
    view_store: true,
    add_items_to_cart: true,
    remove_items_from_cart: true,
    view_users_menu: false,
    transfer_remove_users: false,
    insert_new_items_catalog: false,
    remove_items_catalog: false,
    view_analytics: true,
    view_own_team_analytics: false,
    view_other_teams_analytics: false,
    view_system_surveys: false,
    configure_own_profile: true,
    respond_system_surveys: true,
  },
  SUPER_ADMIN: {
    view_personal_updates: true,
    view_company_updates: true,
    view_team_wall: true,
    send_compliment: true,
    like_compliment_sent_by_self: true,
    like_compliment_sent_by_others: true,
    view_store: true,
    add_items_to_cart: true,
    remove_items_from_cart: true,
    view_users_menu: true,
    transfer_remove_users: true,
    insert_new_items_catalog: true,
    remove_items_catalog: true,
    view_analytics: true,
    view_own_team_analytics: true,
    view_other_teams_analytics: true,
    view_system_surveys: true,
    configure_own_profile: true,
    respond_system_surveys: true,
  },
};

export type PermissionKey = keyof typeof DEFAULT_PERMISSIONS.SUPERVISOR;

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
