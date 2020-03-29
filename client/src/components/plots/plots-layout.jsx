import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import WorkingProbabilityPlot from './working-probability-plot';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        flexFlow: "wrap",
        flexGrow: 1
    }
}));

export default function PlotsLayout({ plots }) {

    const classes = useStyles();

    return (
        <div className={classes.container}>
            {plots.map((plot, i) => (<WorkingProbabilityPlot key={i} plotData={plot} />))}
        </div>
    );
}