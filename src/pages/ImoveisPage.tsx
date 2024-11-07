import React from 'react';
import { useFetchImoveis } from '../hooks/useFetchImoveis';
import { Imovel } from '../types/Imovel';

const ImoveisPage: React.FC = () => {
  const imoveis  = useFetchImoveis();

  return (
      <div className="imoveis-grid">
        {Array.isArray(imoveis) && imoveis.map((imovel: Imovel) => (
            <div key={imovel.id} className="imovel-card">
              <img src={imovel.imageUrl} alt={imovel.descricaoImovel} />

              <h2>{imovel.descricaoImovel}</h2>

              <p>Valor: R$ {imovel.precoImovel}</p>

              <p>Tamanho: {imovel.tamanhoImovel} m²</p>

              <p>Status: {imovel.statusImovel ? "Disponível" : "Indisponível"}</p>

              <p>Tipo: {imovel.tipoImovel ? "Residencial" : "Comercial"}</p>

              <p>Responsável: {imovel.funcionario?.nome || "Não informado"}</p>

              <p>Endereço:
                {imovel.enderecoImovel ?
                    `${imovel.enderecoImovel.rua}, ${imovel.enderecoImovel.numero} - ${imovel.enderecoImovel.cidade}` :
                    "Endereço não disponível"}
              </p>

              {imovel.historicoManutencao && imovel.historicoManutencao.length > 0 && (
                  <div className="historico-manutencao">
                    <h4>Histórico de Manutenção</h4>
                    <ul>
                      {imovel.historicoManutencao.map((manutencao, index) => (
                          <li key={index}>{manutencao.descricao} - {manutencao.data}</li>
                      ))}
                    </ul>
                  </div>
              )}

              {imovel.vistorias && imovel.vistorias.length > 0 && (
                  <div className="vistorias">
                    <h4>Vistorias</h4>
                    <ul>
                      {imovel.vistorias.map((vistoria, index) => (
                          <li key={index}>Data: {vistoria.data}, Status: {vistoria.status}</li>
                      ))}
                    </ul>
                  </div>
              )}
            </div>
        ))}
      {!Array.isArray(imoveis) && <p>Carregando imóveis...</p>}
      {Array.isArray(imoveis) && imoveis.length === 0 && <p>Nenhum imóvel disponível no momento.</p>}
    </div>
  );
};

export default ImoveisPage;