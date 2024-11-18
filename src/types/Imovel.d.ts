// src/types/Imovel.ts
export interface FotoImovel {
    id?: number; // Adicione outros campos se necessário
    urlFotoImovel: string;
}

export interface Imovel {
    idImovel: number;
    tipoImovel: string;
    descricaoImovel: string;
    statusImovel: boolean;
    tamanhoImovel: number;
    precoImovel: number;
    enderecoImovel: {
        rua: string;
        numero: string;
        cidade: string;
    };
    fotosImovel?: FotoImovel[]; // Atualizado para refletir o back-end
}
