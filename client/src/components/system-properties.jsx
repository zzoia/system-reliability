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

    const mappedModules = modules.map(mod => ({ id: mod.id, failureRate: 0, recoveryRate: 0, left: 0 }));

    const setModule = (data) => {
        const toUpdate = mappedModules.find(currData => currData.id === data.id);
        toUpdate.failureRate = data.failureRate;
        toUpdate.recoveryRate = data.recoveryRate;
        toUpdate.left = data.left;
    }

    const moduleEditors = modules.map((mod) => (
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