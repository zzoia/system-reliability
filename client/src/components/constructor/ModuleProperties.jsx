import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { NODE_KEY } from '../../utils/GraphConfig';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "center",

    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '150px',
    }
  },
  moduleName: {
    margin: "0 8px 0 12px",
    width: "16px"
  }
}));

export const ModuleProperties = ({ moduleData, onChange }) => {

  const classes = useStyles();

  const [recoveryRate, setRecoveryRate] = useState(moduleData.recoveryRate);
  const [failureRate, setFailureRate] = useState(moduleData.failureRate);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    onChange({ id: moduleData[NODE_KEY], failureRate, recoveryRate, left });
  }, [recoveryRate, failureRate, left]);

  const updateField = (fieldSetter) => (event) => fieldSetter(event.target.value);

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <Typography className={classes.moduleName}>{moduleData.title}</Typography>
      <TextField
        required
        label="Відмова, λ"
        value={failureRate}
        onChange={updateField(setFailureRate)}
        InputProps={{
          inputProps: {
            step: 0.0001,
            min: 0
          }
        }}
        type="number" />
      <TextField
        required
        label="Відновлення, μ"
        value={recoveryRate}
        onChange={updateField(setRecoveryRate)}
        InputProps={{
          inputProps: {
            step: 0.01,
            min: 0
          }
        }}
        type="number" />
      <TextField
        required
        label="Оновлення"
        value={left}
        onChange={updateField(setLeft)}
        InputProps={{
          inputProps: {
            step: 1,
            min: -1,
            max: 5
          }
        }}
        type="number" />
    </form>
  );
}

export default ModuleProperties;