import React from 'react';
import { makeStyles } from '@material-ui/core';
import { round } from '../../utils/utils';

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

export default function EquationRightSide({ coeffs }) {

    const classes = useStyles();

    const data = coeffs
        .map((coeff, index) => ({ coeff: round(coeff), index }))
        .filter(({ coeff, _ }) => (coeff !== 0))
        .map(({ coeff, index }, i) => (
            <div className={classes.coeff} key={index}>
                {`${((i === 0 || coeff < 0) ? "" : "+ ")}${coeff} * P${index + 1}(t)`}
            </div>
        ));

    return (
        <div className={classes.row}>
            {data}
        </div>
    )
}