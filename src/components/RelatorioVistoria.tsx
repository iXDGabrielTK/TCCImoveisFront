import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { useToast } from "../context/ToastContext";

interface FotoVistoriaRelatorio {
    id: number;
    urlFotoVistoria: string;
}

interface FotoImovelRelatorio {
    id: number;
    urlFotoImovel: string;
}

interface AmbienteDetalhesRelatorio {
    id: number;
    nome: string;
    descricao: string;
    fotos: FotoVistoriaRelatorio[];
}

interface ImovelRelatorioVistoria {
    idImovel: number;
    tipoImovel: string;
    descricaoImovel: string;
    enderecoImovel?: {
        rua: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
    fotosImovel: FotoImovelRelatorio[];
}

interface VistoriaRelatorio {
    idVistoria: number;
    tipoVistoria: string;
    laudoVistoria: string;
    dataVistoria: string;
    imovel: ImovelRelatorioVistoria;
    ambientes: AmbienteDetalhesRelatorio[];
}

// Interface para os itens do Select (Retorno do findAllActiveVistoriasForSelection)
interface VistoriaListItem {
    idVistoria: number;
    idImovel: number;
    descricaoImovel: string;
    dataVistoria: string;
    laudoVistoria: string; // Para exibir no select se quiser
}

interface jsPDFWithPlugin extends jsPDF {
    lastAutoTable?: {
        finalY: number;
    };
    internal: jsPDF["internal"] & {
        getNumberOfPages: () => number;
    };
}

// Função para carregar imagens como Base64 usando o ENDPOINT DE PROXY do backend
const loadImageAsBase64 = async (url: string): Promise<string> => {
    try {
        // Codifica a URL do S3 para ser passada como parâmetro na URL do proxy
        const proxyUrl = `http://localhost:8080/image-proxy?s3Url=${encodeURIComponent(url)}`;

        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("Token de autorização não encontrado. Não é possível carregar a imagem via proxy.");
            return '';
        }

        const response = await fetch(proxyUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error from proxy! Status: ${response.status}. Response: ${errorText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Falha ao carregar imagem como Base64 (via proxy): ${url}`, error);
        return '';
    }
};

const RelatorioVistorias: React.FC = () => {
    const [availableVistorias, setAvailableVistorias] = useState<VistoriaListItem[]>([]);
    const [selectedVistoriaId, setSelectedVistoriaId] = useState<number | null>(null);
    const [reportData, setReportData] = useState<VistoriaRelatorio | null>(null);
    const [isLoadingVistorias, setIsLoadingVistorias] = useState(false);
    const { showToast } = useToast();

    const fetchAvailableVistorias = useCallback(async () => {
        setIsLoadingVistorias(true);
        try {
            const response = await api.get<VistoriaListItem[]>("/relatorios/vistorias/lista-para-selecao");
            setAvailableVistorias(response.data);
        } catch (error) {
            console.error("Erro ao buscar lista de vistorias:", error);
            showToast("Erro ao carregar lista de vistorias.", "error");
        } finally {
            setIsLoadingVistorias(false);
        }
    }, [showToast]);

    useEffect(() => {
        void fetchAvailableVistorias();
    }, [fetchAvailableVistorias]);

    const fetchReportData = async () => {
        if (!selectedVistoriaId) {
            showToast("Por favor, selecione uma vistoria para gerar o relatório.", "info");
            setReportData(null);
            return;
        }
        try {
            const response = await api.get<VistoriaRelatorio>(`/relatorios/vistorias/${selectedVistoriaId}`);
            setReportData(response.data);
            showToast("Dados do relatório carregados com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao buscar dados do relatório de vistorias:", error);
            showToast("Erro ao carregar dados do relatório de vistorias. Tente novamente.", "error");
            setReportData(null);
        }
    };

    const gerarPDF = async () => {
        if (!reportData || !reportData.imovel) {
            showToast("Não há dados de vistoria ou informações do imóvel para gerar o PDF.", "info");
            return;
        }

        const doc = new jsPDF() as jsPDFWithPlugin;
        let yPos = 40;
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const textWidth = pageWidth - 2 * margin; // Largura útil para o texto

        const logoBase64 = "data:image/png;base64,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";

        // Função para adicionar cabeçalho e rodapé em novas páginas
        const addPageHeaderAndFooter = (pageNumber: number) => {
            const imgWidth = 22;
            const imgHeight = 22;
            const imgY = 12;

            // Logotipo
            doc.addImage(logoBase64, "PNG", margin, imgY, imgWidth, imgHeight);

            // Título do Relatório
            doc.setFontSize(16);
            doc.setTextColor("#333333");
            doc.text("Relatório de Vistoria de Imóvel", pageWidth / 2, imgY + 14, { align: "center" });

            // Data de Geração
            const generationDate = new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            doc.setFontSize(10);
            doc.setTextColor("#666666");
            doc.text(`Gerado em: ${generationDate}`, pageWidth - margin, imgY + 22, { align: "right" });

            // Número da Página
            doc.setFontSize(8);
            doc.setTextColor("#999999");
            doc.text(`Página ${pageNumber} de ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - margin, { align: "center" });

            return imgY + imgHeight + 8; // Reduzido de 10 para 8 (espaço após cabeçalho)
        };

        // Adiciona o cabeçalho da primeira página
        yPos = addPageHeaderAndFooter(1);


        // Adiciona informações do Imóvel
        doc.setFontSize(14);
        doc.setTextColor("#14453e");
        doc.text(`Detalhes da Vistoria - Imóvel ID: ${reportData.imovel.idImovel}`, margin, yPos);
        yPos += 7; // Reduzido de 8 para 7
        doc.setFontSize(12);
        doc.setTextColor("#333333");
        doc.text(`Tipo de Vistoria: ${reportData.tipoVistoria}`, margin, yPos);
        yPos += 5; // Reduzido de 6 para 5
        doc.text(`Data da Vistoria: ${new Date(reportData.dataVistoria).toLocaleDateString('pt-BR')}`, margin, yPos);
        yPos += 5; // Reduzido de 6 para 5
        doc.text(`Descrição do Imóvel: ${reportData.imovel.descricaoImovel}`, margin, yPos);
        yPos += 5; // Reduzido de 6 para 5

        // Quebra de linha para o Laudo
        doc.text(`Laudo:`, margin, yPos);
        const laudoContentWidth = textWidth - doc.getTextWidth('Laudo: ');
        const laudoTextLines = doc.splitTextToSize(reportData.laudoVistoria, laudoContentWidth);
        doc.text(laudoTextLines, margin + doc.getTextWidth('Laudo: '), yPos);
        yPos += (laudoTextLines.length * 6) + 3; // Reduzido de 5 para 3 (padding após laudo)

        yPos += 8; // Reduzido de 10 para 8 (espaço antes das fotos)

        // Dimensões padrão das imagens para o PDF (AJUSTADAS COM BASE NA SUA IMAGEM DE SAÍDA)
        // Para duas fotos por linha, a largura máxima é (pageWidth - 2 * margin - padding entre fotos) / 2
        // Ex: (297 - 2*10 - 5) / 2 = (297 - 25) / 2 = 272 / 2 = 136mm por foto.
        // Se suas fotos reais tiverem aspect ratio 4:3, então 136mm de largura dá 102mm de altura.
        // O `image_11eb1c.png` mostra 2 fotos por linha.
        const defaultImgWidth = (pageWidth - 2 * margin - 5) / 2; // (página - 2 margens - 1 padding) / 2 fotos
        const defaultImgHeight = defaultImgWidth * (3 / 4); // Exemplo: assumindo proporção 4:3 para altura

        // Adiciona fotos do Imóvel (agora via proxy)
        if (reportData.imovel.fotosImovel && reportData.imovel.fotosImovel.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor("#14453e");
            doc.text("Fotos do Imóvel:", margin, yPos);
            yPos += 7; // Reduzido de 8 para 7

            let xImg = margin;
            const imgWidth = defaultImgWidth; // Usando largura calculada
            const imgHeight = defaultImgHeight; // Usando altura calculada
            const padding = 5;

            for (const foto of reportData.imovel.fotosImovel) {
                if (yPos + imgHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = addPageHeaderAndFooter(doc.internal.getNumberOfPages());
                    xImg = margin;
                }
                try {
                    const imgBase64 = await loadImageAsBase64(foto.urlFotoImovel);
                    if (imgBase64) {
                        doc.addImage(imgBase64, "JPEG", xImg, yPos, imgWidth, imgHeight);
                    } else {
                        doc.setFontSize(8);
                        doc.setTextColor("#FF0000");
                        doc.text("Falha ao carregar imagem", xImg, yPos + imgHeight / 2);
                    }
                    xImg += imgWidth + padding;
                    if (xImg + imgWidth > pageWidth - margin) { // Se a próxima imagem exceder a largura
                        xImg = margin;
                        yPos += imgHeight + padding;
                    }
                } catch (e) {
                    console.warn(`Erro inesperado ao adicionar a foto do imóvel ${foto.urlFotoImovel}:`, e);
                    doc.setFontSize(8);
                    doc.setTextColor("#FF0000");
                    doc.text("Erro ao carregar imagem", xImg, yPos + imgHeight / 2);
                    xImg += imgWidth + padding;
                    if (xImg + imgWidth > pageWidth - margin) {
                        xImg = margin;
                        yPos += imgHeight + padding;
                    }
                }
            }
            if (xImg !== margin) { // Se a última imagem não iniciou uma nova linha, ajuste yPos
                yPos += imgHeight + padding;
            }
            yPos += 3; // Reduzido de 5 para 3 (espaço após fotos do imóvel)
        }


        // Adiciona detalhes dos Ambientes (agora via proxy)
        if (reportData.ambientes && reportData.ambientes.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor("#14453e");
            doc.text("Detalhes dos Ambientes:", margin, yPos);
            yPos += 7; // Reduzido de 8 para 7

            for (const ambiente of reportData.ambientes) {
                // Dimensões para fotos de ambiente
                const imgWidthAmb = (pageWidth - 2 * margin - 10 - 2 * 5) / 3; // 3 fotos por linha, 10 de indent, 2*5 padding
                const imgHeightAmb = imgWidthAmb * (3 / 4); // Exemplo: proporção 4:3

                // Estima a altura do ambiente para quebra de página
                const estimatedTextHeight = (doc.splitTextToSize(ambiente.nome, textWidth).length * 6) + (doc.splitTextToSize(ambiente.descricao, textWidth - 10).length * 6);
                const estimatedPhotosHeight = (ambiente.fotos && ambiente.fotos.length > 0) ? (imgHeightAmb + 5) * Math.ceil(ambiente.fotos.length / Math.floor((textWidth - 10) / (imgWidthAmb + 5))) : 0;
                const estimatedAmbienteHeight = estimatedTextHeight + estimatedPhotosHeight + 15; // Paddings e títulos ajustados

                if (yPos + estimatedAmbienteHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = addPageHeaderAndFooter(doc.internal.getNumberOfPages());
                }

                doc.setFontSize(12);
                doc.setTextColor("#000000");
                doc.text(`- Nome do Ambiente: ${ambiente.nome}`, margin + 5, yPos);
                yPos += 6; // Reduzido de 6 para 6 (manteve-se)

                // Quebra de linha para a Descrição do Ambiente
                doc.text(`  Descrição:`, margin + 10, yPos);
                const descContentWidth = textWidth - (margin + 10 + doc.getTextWidth('  Descrição: '));
                const descTextLines = doc.splitTextToSize(ambiente.descricao, descContentWidth);
                doc.text(descTextLines, margin + 10 + doc.getTextWidth('  Descrição: '), yPos);
                yPos += (descTextLines.length * 6) + 3; // Reduzido de 5 para 3

                if (ambiente.fotos && ambiente.fotos.length > 0) {
                    doc.setFontSize(11);
                    doc.setTextColor("#555555");
                    doc.text("  Fotos do Ambiente:", margin + 10, yPos);
                    yPos += 7; // Reduzido de 8 para 7

                    let xImg = margin + 10;
                    const paddingAmb = 5;

                    for (const fotoAmb of ambiente.fotos) {
                        if (yPos + imgHeightAmb > pageHeight - margin) {
                            doc.addPage();
                            yPos = addPageHeaderAndFooter(doc.internal.getNumberOfPages());
                            xImg = margin + 10;
                        }
                        try {
                            const imgBase64Amb = await loadImageAsBase64(fotoAmb.urlFotoVistoria);
                            if (imgBase64Amb) {
                                doc.addImage(imgBase64Amb, "JPEG", xImg, yPos, imgWidthAmb, imgHeightAmb);
                            } else {
                                doc.setFontSize(8);
                                doc.setTextColor("#FF0000");
                                doc.text("Falha ao carregar imagem", xImg, yPos + imgHeightAmb / 2);
                            }
                            xImg += imgWidthAmb + paddingAmb;
                            if (xImg + imgWidthAmb > pageWidth - margin) {
                                xImg = margin + 10;
                                yPos += imgHeightAmb + paddingAmb;
                            }
                        } catch (e) {
                            console.warn(`Erro inesperado ao adicionar a foto do ambiente ${fotoAmb.urlFotoVistoria}:`, e);
                            doc.setFontSize(8);
                            doc.setTextColor("#FF0000");
                            doc.text("Erro ao carregar imagem", xImg, yPos + imgHeightAmb / 2);
                            xImg += imgWidthAmb + paddingAmb;
                            if (xImg + imgWidthAmb > pageWidth - margin) {
                                xImg = margin + 10;
                                yPos += imgHeightAmb + paddingAmb;
                            }
                        }
                    }
                    if (xImg !== margin + 10) {
                        yPos += imgHeightAmb + paddingAmb;
                    }
                    yPos += 3; // Reduzido de 5 para 3 (espaço após fotos do ambiente)
                } else {
                    doc.setFontSize(11);
                    doc.setTextColor("#555555");
                    doc.text("  Nenhuma foto disponível para este ambiente.", margin + 10, yPos);
                    yPos += 6; // Reduzido de 7 para 6
                }
                yPos += 5; // Manteve-se o espaçamento entre ambientes, pois 5px já é bem compacto.
            }
        } else {
            doc.setFontSize(12);
            doc.setTextColor("#555555");
            doc.text("Nenhum ambiente detalhado disponível para esta vistoria.", margin, yPos);
            yPos += 10;
        }

        const filename = `relatorio-vistoria-imovel-${reportData.imovel.idImovel}.pdf`;

        doc.save(filename);
        showToast("Relatório PDF de Vistoria gerado com sucesso!", "success");
    };

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
            <Typography variant="h5" gutterBottom>
                Gerar Relatório de Vistorias
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", width: "100%" }}>
                <FormControl sx={{ minWidth: 250, flexGrow: 1 }}>
                    <InputLabel id="select-vistoria-label">Selecione a Vistoria</InputLabel>
                    <Select
                        labelId="select-vistoria-label"
                        id="select-vistoria"
                        value={selectedVistoriaId || ''}
                        label="Selecione a Vistoria"
                        onChange={(e) => setSelectedVistoriaId(Number(e.target.value))}
                        fullWidth
                        disabled={isLoadingVistorias}
                    >
                        <MenuItem value="">
                            <em>Nenhum</em>
                        </MenuItem>
                        {availableVistorias.map((vistoria) => (
                            <MenuItem key={vistoria.idVistoria} value={vistoria.idVistoria}>
                                {`ID: ${vistoria.idVistoria} - Imóvel: ${vistoria.descricaoImovel || 'Desconhecido'} - Data: ${new Date(vistoria.dataVistoria).toLocaleDateString('pt-BR')}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={fetchReportData}
                    sx={{ alignSelf: "center", minWidth: 150 }}
                    disabled={!selectedVistoriaId}
                >
                    Buscar Dados da Vistoria
                </Button>
            </Box>

            {reportData && (
                <Box sx={{ width: "100%", mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Dados da Vistoria:
                    </Typography>
                    <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: '4px' }}>
                        <Typography variant="body1">
                            <strong>ID Vistoria:</strong> {reportData.idVistoria}
                        </Typography>
                        {reportData.imovel && (
                            <>
                                <Typography variant="body1">
                                    <strong>Imóvel ID:</strong> {reportData.imovel.idImovel}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Descrição do Imóvel:</strong> {reportData.imovel.descricaoImovel}
                                </Typography>
                            </>
                        )}
                        <Typography variant="body1">
                            <strong>Tipo de Vistoria:</strong> {reportData.tipoVistoria}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Data da Vistoria:</strong> {new Date(reportData.dataVistoria).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Laudo:</strong> {reportData.laudoVistoria}
                        </Typography>

                        {reportData.imovel && reportData.imovel.fotosImovel && reportData.imovel.fotosImovel.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Fotos do Imóvel:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {reportData.imovel.fotosImovel.map((foto, index) => (
                                        <img
                                            key={index}
                                            src={foto.urlFotoImovel}
                                            alt={`Imóvel ${foto.id}`}
                                            style={{ width: 100, height: 70, objectFit: 'cover', border: '1px solid #eee' }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {reportData.ambientes && reportData.ambientes.length > 0 ? (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1">Ambientes:</Typography>
                                {reportData.ambientes.map((ambiente, index) => (
                                    <Box key={index} sx={{ ml: 2, mt: 2, borderLeft: '2px solid #007bff', pl: 1 }}>
                                        <Typography variant="body2">
                                            <strong>Nome:</strong> {ambiente.nome}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Descrição:</strong> {ambiente.descricao}
                                        </Typography>
                                        {ambiente.fotos && ambiente.fotos.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="caption" display="block">Fotos do Ambiente:</Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {ambiente.fotos.map((fotoAmb, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={fotoAmb.urlFotoVistoria}
                                                            alt={`Ambiente ${ambiente.nome} foto ${idx + 1}`}
                                                            style={{ width: 80, height: 60, objectFit: 'cover', border: '1px solid #eee' }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                        {(!ambiente.fotos || ambiente.fotos.length === 0) && (
                                            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                                                Nenhuma foto disponível para este ambiente.
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                                Nenhuma informação de ambientes disponível para esta vistoria.
                            </Typography>
                        )}
                    </Box>
                    <Button variant="contained" color="secondary" onClick={gerarPDF} sx={{ mt: 2 }}>
                        Gerar PDF da Vistoria
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default RelatorioVistorias;