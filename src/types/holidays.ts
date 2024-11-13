// src/types/holidays.ts
export function getHolidays(year: number): string[] {
    // Feriados fixos (os mesmos todos os anos)
    const fixedHolidays = [
        `${year}-01-01`, // Confraternização Universal
        `${year}-04-21`, // Tiradentes
        `${year}-05-01`, // Dia do Trabalho
        `${year}-09-07`, // Independência do Brasil
        `${year}-10-12`, // Nossa Senhora Aparecida
        `${year}-11-02`, // Finados
        `${year}-11-15`, // Proclamação da República
        `${year}-12-25`, // Natal
    ];

    // Feriados fixos estaduais e municipais
    const stateHolidays = [
        `${year}-05-13`, // Padroeira do Município – Nossa Senhora de Fátima (Cianorte, PR)
        `${year}-07-26`  // Emancipação Política do Município de Cianorte
    ];

    // Função para calcular a Páscoa (base para feriados móveis)
    function calculateEaster(year: number): Date {
        const f = Math.floor;
        const G = year % 19;
        const C = f(year / 100);
        const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
        const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
        const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
        const L = I - J;
        const month = 3 + f((L + 40) / 44);
        const day = L + 28 - 31 * f(month / 4);
        return new Date(year, month - 1, day);
    }

    // Calcula a Páscoa e feriados móveis baseados nela
    const easter = calculateEaster(year);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2); // Sexta-feira Santa
    const carnivalMonday = new Date(easter);
    carnivalMonday.setDate(easter.getDate() - 48); // Segunda-feira de Carnaval
    const carnivalTuesday = new Date(easter);
    carnivalTuesday.setDate(easter.getDate() - 47); // Terça-feira de Carnaval
    const ashWednesday = new Date(easter);
    ashWednesday.setDate(easter.getDate() - 46); // Quarta-feira de Cinzas
    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60); // Corpus Christi

    // Formata as datas móveis para o formato YYYY-MM-DD
    const movableHolidays = [
        goodFriday.toISOString().split('T')[0],    // Sexta-feira Santa
        carnivalMonday.toISOString().split('T')[0], // Segunda-feira de Carnaval
        carnivalTuesday.toISOString().split('T')[0], // Terça-feira de Carnaval
        ashWednesday.toISOString().split('T')[0],   // Quarta-feira de Cinzas (até 14h)
        corpusChristi.toISOString().split('T')[0],  // Corpus Christi
    ];

    // Combina todos os feriados
    return [...fixedHolidays, ...stateHolidays, ...movableHolidays];
}
