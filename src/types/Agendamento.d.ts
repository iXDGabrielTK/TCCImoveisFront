export interface Agendamento {
    id: number;
    descricao: string;
    ativo: boolean;
    dataAgendamento: string; // ou Date
    nomeVisitante: string;
    horarioMarcado: string;
}
