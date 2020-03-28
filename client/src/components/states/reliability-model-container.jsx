import React, { useState } from 'react';
import AdjacencyList from './adjacency-list';
import { makeStyles } from '@material-ui/core/styles';
import StateGraph from './state-graph';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import LocalStorageManager from '../../utils/local-storage-manager';

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
        result += moduleState.name;
        if (moduleState.left !== null) {
            result += `(${moduleState.left})`;
        }

        if (!moduleState.isWorking) {
            result += "(-)";
        }

        result += " ";
    });
    return result.substring(0, result.length - 1);
}

const statesToColor = (status) => {
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
}

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
            strokeColor: statesToColor(node.fromState.status),
            highlightColor: statesToColor(node.fromState.status)
        };
    });

    graphNodes = graphNodes.filter(node => graphLinks.some(link => link.source === node.id || link.target === node.id));

    return {
        nodes: graphNodes,
        links: graphLinks
    };
}

export default function ReliabilityModelContainer() {

    const localStorageManager = new LocalStorageManager();
    let adjacencyList = localStorageManager.getAdjacencyList();

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
                            name="checkedB"
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
}