import axios from "axios";



export const fetchAgendamentos = async (usuarioId: number): Promise<Agendamento[]> => {
    try {
        const response = await axios.get(`/agendamentos/usuario/${usuarioId}`);
        console.log("Resposta completa da API:", response); // Verifica a estrutura completa
        console.log("Dados recebidos da API:", response.data); // Verifica os dados retornados pela API

        if (Array.isArray(response.data)) {
            return response.data.map((item) => ({
                id: item.id,
                dataAgendamento: item.dataAgendamento,
                nomeVisitante: item.nomeVisitante,
                horarioMarcado: item.horarioMarcado,
                cancelado: item.cancelado,
            }));
        } else {
            console.error("Resposta inesperada da API:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return [];
    }
};



export const cancelarAgendamento = async (id: number) => {
    try {
        await axios.put(`/agendamentos/${id}/cancelar`); // Usa o método PUT
    } catch (error) {
        console.error("Erro ao cancelar agendamento:", error);
        throw error;
    }
};
