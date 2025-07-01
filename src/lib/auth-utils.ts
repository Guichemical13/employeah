/**
 * Função utilitária para obter o token de autenticação
 * Verifica tanto localStorage quanto sessionStorage
 * @returns string | null - Token de autenticação ou null se não encontrado
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
 * Função utilitária para criar headers de autenticação
 * @returns object - Headers com Authorization se token existir
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  
  return token 
    ? { 'Authorization': `Bearer ${token}` }
    : {};
}

/**
 * Função utilitária para criar headers completos para requisições JSON
 * @returns object - Headers com Content-Type e Authorization
 */
export function getJsonAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeaders()
  };
}
