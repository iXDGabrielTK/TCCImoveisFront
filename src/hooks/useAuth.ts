import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.context';

/**
 * Hook personalizado para acessar o contexto de autenticação
 * @returns O contexto de autenticação com estado e funções
 * @example
 * // Em um componente funcional:
 * const { isAuthenticated, user, login, logout, hasRole } = useAuth();
 * 
 * // Verificar se o usuário está autenticado
 * if (isAuthenticated) {
 *   // Fazer algo com o usuário autenticado
 *   console.log(user);
 * }
 * 
 * // Verificar se o usuário tem um papel específico
 * if (hasRole('admin')) {
 *   // Mostrar conteúdo apenas para administradores
 * }
 */
export const useAuth = () => useContext(AuthContext);

export default useAuth;
