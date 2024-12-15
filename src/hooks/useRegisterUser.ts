import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { AxiosResponse } from 'axios';

interface RegisterData {
  nome: string;
  telefone: string;
  login: string;
  senha: string;
  tipo: boolean;
}

const registerUser = (data: RegisterData): Promise<AxiosResponse<unknown>> => {
  return api.post('/usuarios', data);
};

// Função de mutação usando `registerUser`
export function useRegisterDataMutate() {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<unknown>, Error, RegisterData>({
    mutationFn: registerUser,
    retry: 2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registerUser'] });
    },
  });
}
