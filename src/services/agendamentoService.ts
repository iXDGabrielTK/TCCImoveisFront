    import api from "./api"; // Usa a instância configurada

    export interface Agendamento {
        id: number;
        dataAgendamento: string;
        nomeVisitante: string;
        horarioMarcado: boolean; // O front-end agora espera boolean
        cancelado: boolean;
    }

    export const fetchAgendamentos = async (usuarioId: number): Promise<Agendamento[]> => {
        try {
            const response = await api.get(`/agendamentos/usuario/${usuarioId}`);
            console.log("Dados recebidos da API:", response.data);

            if (Array.isArray(response.data)) {
                return response.data.map((item) => ({
                    id: item.id,
                    dataAgendamento: item.dataAgendamento,
                    nomeVisitante: item.nomeVisitante,
                    horarioMarcado: item.horarioMarcado === "true",
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

    // Cancela um agendamento
    export const cancelarAgendamento = async (id: number): Promise<void> => {
        try {
            await api.put(`/agendamentos/${id}/cancelar`);
            console.log(`Agendamento ${id} cancelado com sucesso`);
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            throw error;
        }
    };
