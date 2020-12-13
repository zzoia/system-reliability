import React, { useState } from 'react';
import AdjacencyList from './AdjacencyList';
import { makeStyles } from '@material-ui/core/styles';
import StateGraph from './StateGraph';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { connect } from 'react-redux';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        height: "inherit",
        alignItems: "stretch",
        marginTop: "48px"
    },
    settings: {
        flexShrink: 0
    }
}));

const modulesToLabel = (modules) => {
    let result = ""
    modules.forEach(moduleState => {
        result += moduleState.isWorking ? "1" : "0";
        if (moduleState.left !== null) {
            result += `(${moduleState.left})`;
        }
    });
    return result;
};

export const statusToColor = (status) => {
    switch (status) {
        case "working":
            return "#16b580";
        case "waitingRecovery":
            return "#ebcf34";
        case "terminal":
            return "#ff4800";
        default:
            break;
    }
};

const getGraph = (adjacencyList, includeTerminal) => {

    const graphLinks = [];
    let graphNodes = adjacencyList.map(node => {
        const id = modulesToLabel(node.fromState.moduleStates);

        if (includeTerminal || node.fromState.status !== "terminal") {
            node.toStates.forEach(toState => {

                const label = toState.isRecovering ? `${toState.withRate}, μ` : `${toState.withRate}, λ`;

                graphLinks.push({
                    source: id,
                    target: modulesToLabel(toState.toState.moduleStates),
                    label
                });
            });
        }
        return {
            id,
            strokeColor: statusToColor(node.fromState.status),
            highlightColor: statusToColor(node.fromState.status)
        };
    });

    graphNodes = graphNodes.filter(node => graphLinks.some(link => link.source === node.id || link.target === node.id));

    if (graphNodes.length > 64) {
        return null;
    }

    return {
        nodes: graphNodes,
        links: graphLinks
    };
};

const ReliabilityModelContainer = ({ adjacencyList }) => {

    const classes = useStyles();
    const [includeTerminal, setIncludeTerminal] = useState(false);

    const [graphData, setGraphData] = useState(getGraph(adjacencyList, includeTerminal));

    const handleGraphFilter = (event) => {
        const include = event.target.checked;
        setIncludeTerminal(include);

        setGraphData(getGraph(adjacencyList, include))
    }

    return (
        <div className={classes.container}>
            <div className={classes.settings}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includeTerminal}
                            onChange={handleGraphFilter}
                            color="primary"
                        />
                    }
                    label="Непрацездатні стани"
                />
            </div>
            <StateGraph stateGraph={graphData} />
            <AdjacencyList adjacencyList={adjacencyList} />
        </div>
    );
};

const mapStateToProps = function (state) {
    return {
        adjacencyList: state.systemStateAdjacencyList
    }
};

export default connect(mapStateToProps)(ReliabilityModelContainer);