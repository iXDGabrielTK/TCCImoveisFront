export interface Notificacao {
    id: number;
    titulo: string;
    mensagem: string;
    dataCriacao: string;
    lida: boolean;
    respondida: boolean;
    arquivada: boolean;
    tipo: 'Sistema' | 'Agendamento' | 'Proposta' | 'Corretor' | 'Imobiliaria';
    resumo: string;
    nomeUsuario?: string;
    emailUsuario?: string;
    creciSolicitado?: string;
    cnpj?: string;
    imagemUrl?: string;
}

