/*
import React from 'react';
import DatePicker, { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CustomDatePicker.css';

type CustomDatePickerProps = DatePickerProps & {
    label?: string; // Label opcional
    errorMessage?: string; // Mensagem de erro opcional
    holidays?: string[]; // Lista de feriados
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
                                                               label,
                                                               errorMessage,
                                                               holidays = [],
                                                               ...props
                                                           }) => {
    const dayClassName = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0];
        if (holidays.includes(formattedDate)) {
            return 'holiday'; // Aplica a classe 'holiday' para feriados
        }
        return undefined;
    };

    return (
        <div className="custom-date-picker-container">
            {label && <label className="custom-date-picker-label">{label}</label>}
            <DatePicker {...props} className="custom-date-picker-input" dayClassName={dayClassName} />
            {errorMessage && <span className="custom-date-picker-error">{errorMessage}</span>}
        </div>
    );
};

export default CustomDatePicker;
*/