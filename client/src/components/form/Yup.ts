import * as Yup from 'yup';

Yup.setLocale({
    mixed: {
        required: 'Requerido',
    },
    number: {
        positive: 'Debe ser un número positivo',
        integer: 'Debe ser un número entero',
        lessThan: 'Debe ser menor a ${less}',
        moreThan: 'Debe ser mayor a ${more}',
        min: 'Debe ser como mínimo ${min}',
        max: 'Debe ser como máximo ${max}',
    },
    string: {
        email: 'Debe ser una dirección de correo válida',
    }
});

export default Yup;
