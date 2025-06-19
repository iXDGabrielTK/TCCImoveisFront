export interface FotoImovel {
    idFotosImovel: number;
    urlFotoImovel: string;
}

export interface Imovel {
    idImovel: number;
    tipoImovel: string;
    descricaoImovel: string;
    statusImovel: boolean;
    tamanhoImovel: number;
    precoImovel: number;
    historicoManutencao: string;
    enderecoImovel: {
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
    fotosImovel: FotoImovel[];
    apagado: boolean;
    favoritado?: boolean;
}
