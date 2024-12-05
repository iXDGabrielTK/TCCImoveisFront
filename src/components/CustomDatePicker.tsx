import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CustomDatePicker.css';

registerLocale('pt-BR', ptBR);

type CustomDatePickerProps = {
    label?: string;
    errorMessage?: string;
    holidays?: string[]; // Feriados que serão desabilitados
    selected?: Date;
    excludeDates?: Date[]; // Datas específicas que serão desabilitadas
    onChange: (date: Date | null) => void;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
                                                               label,
                                                               errorMessage,
                                                               holidays = [],
                                                               selected,
                                                               onChange,
                                                           }) => {

    const dayClassName = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0];
        return holidays.includes(formattedDate) ? 'holiday' : '';
    };

    return (
        <div className="custom-date-picker-container">
            {label && <label className="custom-date-picker-label">{label}</label>}
            <DatePicker
                selected={selected}
                onChange={(date) => {
                    if (date) {
                        console.log("Data selecionada no DatePicker:", date);
                        onChange(date);
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
