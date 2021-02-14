import React from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';

import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

const useStyles = makeStyles(theme => ({
    container: {
        margin: theme.spacing(2)
    }
}));

export const WorkingProbabilityPlot = ({ plotData }) => {

    const classes = useStyles();

    const data = plotData.map(plot => (
        {
            x: plot.plotData.map(pl => pl.time),
            y: plot.plotData.map(pl => pl.aggregatedProbability),
            mode: 'lines+markers',
            name: `λ = ${(plot.failureRate === -1 ? "Поточне значення" : plot.failureRate)}`,
            line: { shape: 'spline' },
            type: 'scatter'
        }
    ))

    return (
        <div className={classes.container}>
            <Card>
                <CardContent>
                    <Plot
                        data={data}
                        layout={{ title: plotData[0] && `Модуль '${plotData[0].moduleName}'` }}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkingProbabilityPlot;