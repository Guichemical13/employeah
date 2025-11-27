-- Script SQL para dar permissões de gestão de catálogo aos supervisores
-- Execute este script no banco de dados para permitir que supervisores criem/editem/removam itens e categorias

-- Primeiro, identifique o ID do supervisor que precisa das permissões
-- Substitua '1' pelo ID real do supervisor

-- Dar permissão para inserir novos itens no catálogo
INSERT INTO "UserPermission" ("userId", "permission", "value", "createdAt", "updatedAt")
VALUES (1, 'insert_new_items_catalog', true, NOW(), NOW())
ON CONFLICT ("userId", "permission") 
DO UPDATE SET "value" = true, "updatedAt" = NOW();

-- Dar permissão para remover itens do catálogo
INSERT INTO "UserPermission" ("userId", "permission", "value", "createdAt", "updatedAt")
VALUES (1, 'remove_items_catalog', true, NOW(), NOW())
ON CONFLICT ("userId", "permission") 
DO UPDATE SET "value" = true, "updatedAt" = NOW();

-- Verificar as permissões do supervisor
SELECT u.id, u.name, u.email, u.role, up.permission, up.value
FROM "User" u
LEFT JOIN "UserPermission" up ON u.id = up."userId"
WHERE u.id = 1;

-- OU dar permissões para TODOS os supervisores da empresa (cuidado!)
-- Substitua 'ID_DA_EMPRESA' pelo ID real da empresa

-- INSERT INTO "UserPermission" ("userId", "permission", "value", "createdAt", "updatedAt")
-- SELECT u.id, 'insert_new_items_catalog', true, NOW(), NOW()
-- FROM "User" u
-- WHERE u.role = 'SUPERVISOR' AND u."companyId" = ID_DA_EMPRESA
-- ON CONFLICT ("userId", "permission") 
-- DO UPDATE SET "value" = true, "updatedAt" = NOW();

-- INSERT INTO "UserPermission" ("userId", "permission", "value", "createdAt", "updatedAt")
-- SELECT u.id, 'remove_items_catalog', true, NOW(), NOW()
-- FROM "User" u
-- WHERE u.role = 'SUPERVISOR' AND u."companyId" = ID_DA_EMPRESA
-- ON CONFLICT ("userId", "permission") 
-- DO UPDATE SET "value" = true, "updatedAt" = NOW();
