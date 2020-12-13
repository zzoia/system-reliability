import React, { useState, useEffect } from 'react';
import ModuleProperties from './ModuleProperties';
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

export const SystemProperties = ({ modules, onInvestigate }) => {

    const classes = useStyles();

    const [mappedModules, setMappedModules] = useState([...modules]);

    useEffect(() => {
        setMappedModules([...modules]);
    }, [modules]);

    const setModule = (data) => {
        const toUpdate = mappedModules.find(currData => currData.id === data.id);
        toUpdate.failureRate = data.failureRate;
        toUpdate.recoveryRate = data.recoveryRate;
        toUpdate.left = data.left;

        setMappedModules([...mappedModules]);
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

export default SystemProperties;