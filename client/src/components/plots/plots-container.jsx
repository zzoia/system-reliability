import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import WorkingProbabilityPlot from './working-probability-plot';
import LocalStorageManager from '../../utils/local-storage-manager';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { startNodeId, endNodeId } from '../../utils/graph-data';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        height: "inherit",
        alignItems: "stretch",
        marginTop: "48px",
        flexDirection: "column"
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    settings: {
        display: "flex",
        alignItems: "center"
    }
}));

export default function PlotsContainer() {

    const classes = useStyles();

    const [plots, setPlots] = useState([]);
    const [moduleName, setModuleName] = useState("");
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(1000);
    const [step, setStep] = useState(50);

    const localStorageManager = new LocalStorageManager();
    const systemRequest = localStorageManager.getSystemRequest();

    const loadPlotData = async () => {

        const request = JSON.stringify({
            moduleName,
            failureRates: [0.0001, 0.0002, 0.0003],
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

        setPlots(await response.json());
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
                <Button variant="contained"
                    color="primary"
                    className={classes.formControl}
                    onClick={handleClick}>
                    Побудувати графік
                </Button>
            </div>
            {plots.length && <WorkingProbabilityPlot plotData={plots} />}
        </div>
    )
}