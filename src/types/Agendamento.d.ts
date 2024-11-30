export interface Agendamento {
    id: number;
    dataAgendamento: string; // Em formato ISO (ex: "2024-05-01")
    nomeVisitante: string;
    horarioMarcado: boolean;
    cancelado: boolean;
}