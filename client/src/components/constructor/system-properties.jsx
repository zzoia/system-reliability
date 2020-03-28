import React from 'react';
import ModuleProperties from './module-properties';
import { makeStyles, Button } from '@material-ui/core';

const useStyles = makeStyles({
    systemRates: {
        marginLeft: "4px",
        display: "flex",
        flexDirection: "column"
    },
    submitButton: {
        margin: "16px"
    }
});

export default function SystemProperties({ modules, onInvestigate }) {

    const classes = useStyles();

    const mappedModules = modules.map((mod, i) => ({ title: mod.title, id: mod.id, failureRate: i * 0.0001, recoveryRate: i * 0.01, left: 0 }));

    const setModule = (data) => {
        const toUpdate = mappedModules.find(currData => currData.id === data.id);
        toUpdate.failureRate = data.failureRate;
        toUpdate.recoveryRate = data.recoveryRate;
        toUpdate.left = data.left;
    }

    const moduleEditors = mappedModules.map((mod) => (
        <ModuleProperties
            key={mod.id}
            moduleData={mod}
            onChange={setModule} />
    ));

    return (
        <div className={classes.systemRates}>
            {moduleEditors}
            <Button
                variant="contained"
                color="primary"
                className={classes.submitButton}
                onClick={() => onInvestigate(mappedModules)}>Дослідити систему</Button>
        </div>
    );

}