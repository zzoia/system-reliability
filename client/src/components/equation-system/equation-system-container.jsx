import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CardContent, Card } from '@material-ui/core';
import LocalStorageManager from '../../utils/local-storage-manager';
import { statusToColor } from '../states/reliability-model-container'
import EquationRightSide from './equation-right-side';

const useStyles = makeStyles(theme => ({
    container: {
        paddingLeft: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        background: "#f9f9f9",
        height: "inherit",
        alignItems: "center",
        marginTop: "48px"
    },
    system: {
        display: "flex"
    },
    topState: {
        padding: "4px",
        width: "70px"
    },
    topRow: {
        marginLeft: "110px",
        marginBottom: theme.spacing(2),
        flexShrink: 0,
        maxWidth: "1000px",
        overflow: "auto"
    },
    topRowContent: {
        padding: "10px 10px 0 10px",
        marginBottom: "-14px"
    },
    leftSide: {
        display: "flex",
        flexDirection: "column"
    },
    leftSideBar: {
        flexShrink: 0,
        maxHeight: "800px",
        overflow: "auto"
    },
    leftSideState: {
        height: "30px",
        textAlign: "center"
    },
    coefficients: {
        marginLeft: theme.spacing(2),
        overflow: "scroll",
        maxWidth: "1000px"
    }
}));

export default function EquationSystemContainer() {

    const classes = useStyles();

    const [states, setStates] = useState([]);
    const [coeffs, setCoeffs] = useState([]);

    const localStorageManager = new LocalStorageManager();
    const systemRequest = localStorageManager.getSystemRequest();

    const getEquation = async (systemRequest) => {

        const response = await fetch("http://localhost:53294/systemreliability/equation-system", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(systemRequest)
        });

        const data = await response.json();
        setStates(data.systemStates);
        setCoeffs(data.coefficients)
    };

    useEffect(() => {
        getEquation(systemRequest);
    }, []);

    return (
        <div className={classes.container}>
            <Card className={classes.topRow}>
                <CardContent classes={{ root: classes.topRowContent }}>
                    <div className={classes.system}>
                        {
                            states.map((state, index) => (
                                <div
                                    key={index}
                                    className={classes.topState}
                                    style={{ color: statusToColor(state.status) }}>P{index + 1}(t)</div>
                            ))
                        }
                    </div>
                </CardContent>
            </Card>
            <div className={classes.system}>
                    <Card>
                        <CardContent>
                            <div className={classes.leftSide}>
                                {
                                    states.map((state, index) => (
                                        <div
                                            key={index}
                                            className={classes.leftSideState}
                                            style={{ color: statusToColor(state.status) }}>P{index + 1}(t)/dt</div>
                                    ))
                                }
                            </div>
                        </CardContent>
                    </Card>
                <Card className={classes.coefficients}>
                    <CardContent>
                        {coeffs.map((equationCoeffs, index) => (<EquationRightSide coeffs={equationCoeffs} key={index} />))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}