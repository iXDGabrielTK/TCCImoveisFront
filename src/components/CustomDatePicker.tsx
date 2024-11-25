import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale'; // Certifique-se de que o locale está correto
import 'react-datepicker/dist/react-datepicker.css'; // Estilos do DatePicker
import '../styles/CustomDatePicker.css'; // CSS personalizado

registerLocale('pt-BR', ptBR); // Registrar o locale no DatePicker

type CustomDatePickerProps = {
    label?: string;
    errorMessage?: string;
    holidays?: string[]; // Lista de feriados
    selected?: Date; // Data atualmente selecionada
    onChange: (date: Date | null) => void; // Função chamada ao alterar a data
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
                                                               label,
                                                               errorMessage,
                                                               holidays = [],
                                                               selected,
                                                               onChange,
                                                           }) => {
    // Adiciona uma classe para marcar feriados
    const dayClassName = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0]; // Formata a data para comparação
        return holidays.includes(formattedDate) ? 'holiday' : ''; // Classe 'holiday' para feriados
    };

    return (
        <div className="custom-date-picker-container">
            {label && <label className="custom-date-picker-label">{label}</label>}
            <DatePicker
                selected={selected} // Propriedade que reflete a data selecionada
                onChange={(date) => {
                    if (date) {
                        console.log("Data selecionada no DatePicker:", date); // Log para depuração
                        onChange(date); // Atualiza o estado no componente pai
                    } else {
                        console.error("Erro: Nenhuma data foi selecionada.");
                    }
                }}
                className="custom-date-picker-input"
                dayClassName={dayClassName}
                locale="pt-BR"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                placeholderText="Selecione uma data"
            />



            {errorMessage && <span className="custom-date-picker-error">{errorMessage}</span>}
        </div>
    );
};

export default CustomDatePicker;
