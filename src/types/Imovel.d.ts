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
    fotosImovel?: string | string[];
}
