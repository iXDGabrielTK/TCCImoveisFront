export interface Imovel {
    idImovel?: number;
    funcionario: Funcionario;
    tipoImovel: string;
    fotosImovel: { urlFotoImovel: string }[];
    descricaoImovel?: string;
    statusImovel: boolean;
    tamanhoImovel: number;
    precoImovel: number;
    enderecoImovel: Endereco;
    vistorias: Vistorias[];
    historicoManutencao: Manutencao[];
}
