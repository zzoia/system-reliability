import React from 'react';
import AdjacencyList from './adjacency-list';
import { makeStyles } from '@material-ui/core/styles';
import StateGraph from './state-graph';

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        height: "inherit",
        alignItems: "stretch"
    }
}));

export default function ReliabilityModelContainer() {

    const classes = useStyles();

    let adjacencyList = localStorage.getItem("adjacencyList")
    if (!adjacencyList) return (<div />);

    adjacencyList = JSON.parse(adjacencyList);

    const modulesToLabel = (modules) => {
        let result = ""
        modules.forEach(moduleState => {
            result += moduleState.name;
            if (!isNaN(moduleState.left) && !moduleState.isWorking) {
                result += `(${moduleState.left})`;
            } else if (!moduleState.isWorking) {
                result += "(-)";
            }

            result += " ";
        });
        return result.substring(0, result.length - 1);
    }

    const statesToColor = (status) => {
        switch (status) {
            case "working":
                return "#16b580"
            case "waitingRecovery":
                return "#ebcf34"
            case "terminal":
                return "#ff4800"
            default:
                break;
        }
    }

    const graphLinks = [];
    const graphNodes = adjacencyList.map(node => {
        const id = modulesToLabel(node.fromState.moduleStates);
        node.toStates.forEach(toState => {

            const label = toState.isRecovering ? `${toState.withRate}, μ` : `${toState.withRate}, λ`;

            graphLinks.push({
                source: id,
                target: modulesToLabel(toState.toState.moduleStates),
                label
            });
        });
        return {
            id,
            strokeColor: statesToColor(node.fromState.status),
            highlightColor: statesToColor(node.fromState.status)
        };
    });

    return (
        <div className={classes.container}>
            <StateGraph stateGraph={{ nodes: graphNodes, links: graphLinks }} />
            <AdjacencyList adjacencyList={adjacencyList} />
        </div>
    );
}