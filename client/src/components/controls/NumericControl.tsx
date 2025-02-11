import { styled } from '@mui/material/styles'
import {
  Input,
  InputProps,
  Button,
  FormControl,
  FormHelperText,
  FormHelperTextProps,
  InputLabel,
  InputLabelProps,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export interface NumericControlProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: number
  onChange: (val: number) => unknown
  error?: boolean
  fullWidth?: boolean
  label?: string
  helperText?: string

  InputLabelProps?: InputLabelProps
  FormHelperTextProps?: FormHelperTextProps
}

export const NumericControl = ({
  value,
  onChange,
  error,
  fullWidth,
  label,
  helperText,
  InputLabelProps,
  FormHelperTextProps,
  ...props
}: NumericControlProps): JSX.Element => (
  <FormControl error={error} fullWidth={fullWidth}>
    {label && (
      <InputLabel htmlFor={props.id} {...InputLabelProps}>
        {label}
      </InputLabel>
    )}
    <NoWrap>
      <NumericInput
        type='number'
        value={value}
        onFocus={handleNumericFocus}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        fullWidth={fullWidth}
        {...props}
      />
      <PlusButton onClick={() => onChange(value + 1)} />
      <MinusButton onClick={() => onChange(value - 1)} />
    </NoWrap>
    {helperText && (
      <FormHelperText {...FormHelperTextProps}>
        {helperText}
      </FormHelperText>
    )}
  </FormControl>
)

const handleNumericFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  const inputElement = event.target
  inputElement.select()
}

const NoWrap = styled('div')({
  display: 'flex',
  flexFlow: 'row nowrap',
})

const NumericInput = styled(Input)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginTop: 8,
  [theme.breakpoints.down('lg')]: {
    marginRight: 0,
    fontSize: '1em',
  },
  [theme.breakpoints.up('md')]: {
    marginTop: 20,
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: 16,
  },
  '& input': {
    textAlign: 'center',
    '-moz-appearance': 'textfield',
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
}))

interface SqIconButtonProps {
  children: JSX.Element
  onClick: () => unknown
}
const SqIconButton = ({ children, onClick }: SqIconButtonProps) => (
  <Button
    disableRipple
    onClick={onClick}
    size='small'
    variant='contained'
    color='secondary'
  >
    {children}
  </Button>
)

interface PlusButtonProps { onClick: () => unknown }
const PlusButton = (props: PlusButtonProps): JSX.Element => (
  <SqIconButton onClick={props.onClick}><AddIcon /></SqIconButton>
)

interface MinusButtonProps { onClick: () => unknown }
const MinusButton = (props: MinusButtonProps): JSX.Element => (
  <SqIconButton onClick={props.onClick}><RemoveIcon /></SqIconButton>
)
