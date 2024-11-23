import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR   } from 'date-fns/locale/pt-BR'; // Corrigido o caminho do locale
import 'react-datepicker/dist/react-datepicker.css'; // Importar os estilos do DatePicker
import '../styles/CustomDatePicker.css'; // Certifique-se de importar o seu CSS personalizado

registerLocale('pt-BR', ptBR); // Registrar o locale no DatePicker

type CustomDatePickerProps = {
    label?: string;
    errorMessage?: string;
    holidays?: string[];
    selectedDate?: Date;
    onChange: (date: Date | null) => void; // Ajuste aqui
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
                                                               label,
                                                               errorMessage,
                                                               holidays = [],
                                                               selectedDate,
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
                selected={selectedDate}
                onChange={(date) => {
                    if (date) {
                        onChange(date); // Garantimos que 'date' não será null
                    }
                }}
                className="custom-date-picker-input"
                dayClassName={dayClassName}
                locale="pt-BR"
            />
            {errorMessage && <span className="custom-date-picker-error">{errorMessage}</span>}
        </div>
    );
};

export default CustomDatePicker;
