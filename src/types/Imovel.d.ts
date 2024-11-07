export interface Imovel {
    id?: string;
    funcionario: Funcionario;
    tipoImovel: boolean;
    imageUrl: string;
    descricaoImovel?: string;
    statusImovel: boolean;
    tamanhoImovel: number;
    precoImovel: number;
    enderecoImovel: Endereco;
    vistorias: Vistorias[];
    historicoManutencao: Manutencao[];
}
