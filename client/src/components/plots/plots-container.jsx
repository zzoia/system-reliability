import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LocalStorageManager from '../../utils/local-storage-manager';
import PlotsLayout from './plots-layout';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import { startNodeId, endNodeId } from '../../utils/graph-data';
import { round } from '../equation-system/equation-right-side';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        background: "#f9f9f9",
        height: "inherit",
        alignItems: "stretch",
        marginTop: "48px"
    },
    formControl: {
        margin: theme.spacing(1)
    },
    settings: {
        padding: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        alignItems: "stretch",
        flexDirection: "column",
        background: "#fff",
        flexShrink: 0
    }
}));

export default function PlotsContainer() {

    const classes = useStyles();

    const [plots, setPlots] = useState([]);
    const [moduleName, setModuleName] = useState("");

    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(1000);
    const [step, setStep] = useState(50);

    const [startLambda, setStartLambda] = useState(0.0001);
    const [endLambda, setEndLambda] = useState(0.0007);
    const [stepLambda, setStepLambda] = useState(0.0002);

    const localStorageManager = new LocalStorageManager();
    const systemRequest = localStorageManager.getSystemRequest();

    const loadPlotData = async () => {
        const number = (endLambda - startLambda) / stepLambda + 1;
        const lambdas = [];
        for (let i = 0; i < number; i++) {
            lambdas.push(startLambda + i * stepLambda);
        }

        const request = JSON.stringify({
            moduleName,
            failureRates: lambdas,
            fromTime: +startTime,
            toTime: +endTime,
            step: +step,
            hybridSystemRequest: systemRequest
        });

        const response = await fetch("http://localhost:53294/systemreliability/plots", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: request
        });

        const currentPlots = plots.filter(plot => plot[0].moduleName !== moduleName);
        setPlots([await response.json(), ...currentPlots]);
    };

    const nodes = localStorageManager.getGraph().nodes.filter(node => node.id !== endNodeId && node.id !== startNodeId);
    const modules = nodes.map(m => (<MenuItem key={m.title} value={m.title}>{m.title}</MenuItem>))

    const handleClick = () => {
        if (!moduleName) return;
        loadPlotData();
    };

    const updateField = (field) => (event) => field(event.target.value);

    return (
        <div className={classes.container}>
            <div className={classes.settings}>
                <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label">Модуль</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={moduleName}
                        onChange={updateField(setModuleName)}>
                        {modules}
                    </Select>
                </FormControl>
                <Divider />
                <TextField
                    required
                    label="Початок"
                    value={startTime}
                    className={classes.formControl}
                    onChange={updateField(setStartTime)}
                    InputProps={{
                        inputProps: {
                            step: 1,
                            min: 0
                        }
                    }}
                    type="number" />
                <TextField
                    required
                    label="Кінець"
                    value={endTime}
                    className={classes.formControl}
                    onChange={updateField(setEndTime)}
                    InputProps={{
                        inputProps: {
                            step: 1,
                            min: 0
                        }
                    }}
                    type="number" />
                <TextField
                    required
                    label="Крок"
                    className={classes.formControl}
                    value={step}
                    onChange={updateField(setStep)}
                    InputProps={{
                        inputProps: {
                            step: 10,
                            min: 10
                        }
                    }}
                    type="number" />
                <Divider />
                <TextField
                    required
                    label="Початок, λ"
                    value={startLambda}
                    className={classes.formControl}
                    onChange={updateField(setStartLambda)}
                    InputProps={{
                        inputProps: {
                            step: 0.0001,
                            min: 0.0001
                        }
                    }}
                    type="number" />
                <TextField
                    required
                    label="Кінець, λ"
                    value={endLambda}
                    className={classes.formControl}
                    onChange={updateField(setEndLambda)}
                    InputProps={{
                        inputProps: {
                            step: 0.0001,
                            min: 0.0002
                        }
                    }}
                    type="number" />
                <TextField
                    required
                    label="Крок, λ"
                    className={classes.formControl}
                    value={stepLambda}
                    onChange={updateField(setStepLambda)}
                    InputProps={{
                        inputProps: {
                            step: 0.0001,
                            min: 0.0001
                        }
                    }}
                    type="number" />
                <Button variant="contained"
                    color="primary"
                    className={classes.formControl}
                    onClick={handleClick}>
                    Побудувати графік
                </Button>
            </div>
            <PlotsLayout plots={plots} />
        </div>
    )
}