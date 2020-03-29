import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    row: {
        display: "flex",
        height: "30px"
    },
    coeff: {
        flex: "1 1 0px",
        padding: "4px",
        minWidth: "70px"
    }
}));

const round = (number, decimals) => {
    return Math.round((number + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export default function EquationRightSide({ coeffs }) {

    const classes = useStyles();

    const data = coeffs.map((coeff, index) => (
        <div className={classes.coeff} key={index} style={{ color: coeff ? "#000" : "#d3d3d3" }}>
            {round(coeff, 7)}
        </div>
    ));

    return (
        <div className={classes.row}>
            {data}
        </div>
    )
}