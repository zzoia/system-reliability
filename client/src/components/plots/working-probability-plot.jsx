import React from 'react';
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

export default function WorkingProbabilityPlot({ plotData }) {

    const data = plotData.map(plot => (
        {
            x: plot.plotData.map(pl => pl.time),
            y: plot.plotData.map(pl => pl.aggregatedProbability),
            mode: 'lines+markers',
            name: `λ = ${plot.failureRate}`,
            line: { shape: 'spline' },
            type: 'scatter'
        }
    ))

    return (
        <div>
            <Plot
                data={data}
                layout={{ title: plotData[0] && `Модуль '${plotData[0].moduleName}'` }}
            />
        </div>
    );

}