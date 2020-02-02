import * as React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Checkbox from '@material-ui/core/Checkbox'
import MuiCollapse, { CollapseProps } from '@material-ui/core/Collapse'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid, { GridProps } from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import useAuth from '../hooks/useAuth'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import Title from '../components/Title'
import SelectField from '../components/form/SelectField'
import TextField from '../components/form/TextField'
import Yup from '../components/form/Yup'
import Button from '@material-ui/core/Button'
import { isNumber, fetchJsonAuth, SuccessResponse, ErrorResponse, isErrorResponse } from '../utils'
import Typography from '@material-ui/core/Typography'
import useSnackbar from '../hooks/useSnackbar'

const GridItemXs12 = (props: GridProps) => <Grid item xs={12} {...props} />

const Collapse = (props: CollapseProps) => {
  const classes = useCollapseStyles()
  return (
    <MuiCollapse
      component={GridItemXs12}
      classes={{
        // @ts-ignore hidden class rule is missing in ts definition file
        hidden: classes.hidden,
      }}
      {...props}
    >
        <Grid container spacing={2}>
          {props.children}
        </Grid>
    </MuiCollapse>
  )
}

const useCollapseStyles = makeStyles({
  hidden: {
    padding: '0 !important',
  },
})

type ProductionType =
    'bolsa-360'
  | 'paca-360'
  | 'bolsa-6l'
  | 'hielo-5kg'
  | 'bolsa-360-congelada'

interface ProductionTypeOption {
  value: ProductionType
  label: string
}

const productionTypeOptions : ProductionTypeOption[] = [
  {value: 'bolsa-360', label: 'Bolsas de 360 Individuales'},
  {value: 'paca-360', label: 'Empaque de Pacas 360'},
  {value: 'bolsa-6l', label: 'Bolsas de 6 Litros'},
  {value: 'hielo-5kg', label: 'Hielo 5Kg'},
  {value: 'bolsa-360-congelada', label: 'Bolsa 360 Congelada'},
]

const initialValues = {
  productionType: '' as ProductionType | '',
  counterStart: '',
  counterEnd: '',
  amount: '',
  damaged: '0',
}

const validationSchema = Yup.object({
  productionType: Yup.mixed<ProductionType>().oneOf(productionTypeOptions.map(opt => opt.value)).required(),
  counterStart: Yup.mixed().when('productionType', {is: 'bolsa-360',
    then: Yup.number().integer().positive().required(),
  }),
  counterEnd: Yup.mixed().when('productionType', {is: 'bolsa-360',
    then: Yup.number().integer().positive().moreThan(Yup.ref('counterStart')).required(),
  }),
  amount: Yup.mixed().when('productionType', {is: 'paca-360',
    then: Yup.number().integer().min(0).required(),
  }),
  damaged: Yup.mixed().when('productionType', {is: 'paca-360',
    then: Yup.number().integer().min(0).required(),
  }),
})

const RegisterProduction = () => {
  const classes = useStyles()
  const auth = useAuth()
  const showMessage = useSnackbar()

  const [detectDamaged, setDetectDamaged] = useState(false);

  const handleSubmit = async (values: typeof initialValues) => {
    const url = '/api/inventory/movements/production'

    let payload : Object = {
      productionType: values.productionType,
    }

    if (values.productionType === 'bolsa-360') {
      payload = {
        ...payload,
        amount: Number(values.counterEnd) - Number(values.counterStart),
      }
    }

    if (values.productionType === 'paca-360') {
      payload = {
        ...payload,
        amount: Number(values.amount),
        damaged: Number(values.damaged),
      }
    }

    const response : SuccessResponse|ErrorResponse = await fetchJsonAuth(url, auth, {
      method: 'post',
      body: JSON.stringify(payload),
    })

    if (isErrorResponse(response)) {
      showMessage('Error al registrar la producción: ' + response.error.message)
      return
    }

    showMessage('Guardado exitoso')
  }

  return (
    <Layout title='Registrar Producción'>
      <Paper className={classes.paper}>
        <Title>Registrar Producción</Title>
        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({values, setFieldValue}) => <>
            <Grid item xs={12}>
              <SelectField
                name='productionType'
                label='Tipo de Producción'
                emptyOption='Seleccione un tipo de producción'
                options={productionTypeOptions}
              />
            </Grid>
            <Collapse in={values.productionType === 'bolsa-360'}>
              <Grid item xs={12} md={6}>
                <TextField
                  name='counterStart'
                  label='Contador Total Inicial'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name='counterEnd'
                  label='Contador Total Final'
                />
              </Grid>
              {isNumber(values.counterStart) && isNumber(values.counterEnd) && values.counterStart < values.counterEnd &&
                <Typography>
                  Se registrará una producción de {Number(values.counterEnd) - Number(values.counterStart)} bolsas de 360ml individuales.
                </Typography>
              }
            </Collapse>
            <Collapse in={values.productionType === 'paca-360'}>
              <Grid item xs={12}>
                <TextField
                  name='amount'
                  label='Cantidad de Pacas producida'
                />
              </Grid>
              <Grid item xs={12} lg={6} style={{display: 'flex', flexFlow: 'column', justifyContent: 'flex-end'}}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={detectDamaged}
                      onChange={e => {
                        setDetectDamaged(e.target.checked)
                        if (e.target.checked) {
                          setFieldValue('damaged', 'Cargando…')
                        } else {
                          setFieldValue('damaged', '0')
                        }
                      }}
                    />
                  }
                  label='Area intermedia queda vacía'
                />
              </Grid>
              <Grid item xs={12} lg={6}>
                <TextField
                  name='damaged'
                  label='Bolsas individuales dañadas'
                  disabled={detectDamaged}
                />
              </Grid>
            </Collapse>
            <Collapse in={values.productionType !== ''}>
              <Grid item xs={12}>
                <Button variant='contained' color='primary' type='submit' className={classes.button}>
                  Registrar
                </Button>
              </Grid>
            </Collapse>
          </>}
        </Form>
      </Paper>
    </Layout>
  )
}

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  button: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  }
}))

export default RegisterProduction;
