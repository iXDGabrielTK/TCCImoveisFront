import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { AxiosResponse, AxiosError } from 'axios';

interface LoginData {
  login: string;
  senha: string;
}

const loginUser = (data: LoginData): Promise<AxiosResponse<string>> => {
  return api.post('/usuarios/login', data);
};

export function useLoginUser() {
  return useMutation<AxiosResponse<string>, AxiosError, LoginData>({
    mutationFn: loginUser,
    retry: 2,
    onSuccess: (response) => {
      console.log("Login bem-sucedido:", response.data);
    },
  });
}
