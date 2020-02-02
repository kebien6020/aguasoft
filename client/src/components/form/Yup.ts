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
    },
    string: {
        email: 'Debe ser una dirección de correo válida',
    }
});

export default Yup;
