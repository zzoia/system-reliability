import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    row: {
        display: "flex",
        height: "30px"
    },
    coeff: {
        padding: "4px",
        minWidth: "70px"
    }
}));

export const round = (number, decimals) => {
    return Math.round((number + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export default function EquationRightSide({ coeffs }) {

    const classes = useStyles();

    const data = coeffs
        .map((coeff, index) => ({ coeff, index }))
        .filter(({ coeff, _ }) => (round(coeff, 7) !== 0))
        .map(({ coeff, index }, i, arr) => (
            <div className={classes.coeff} key={index}>
                {`${((i === 0 || coeff < 0) ? "" : "+ ")}${round(coeff, 7)} * P${index + 1}(t)`}
            </div>
        ));

    return (
        <div className={classes.row}>
            {data}
        </div>
    )
}