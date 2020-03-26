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

    const graphLinks = [];
    const graphNodes = adjacencyList.map(node => {
        const id = modulesToLabel(node.fromState.moduleStates);
        node.toStates.forEach(toState => {
            graphLinks.push({ source: id, target: modulesToLabel(toState.moduleStates) });
        });
        return {
            id,
            strokeColor: node.fromState.status === "working" ? "#16b580" : "#ff4800",
            highlightColor: node.fromState.status === "working" ? "#16b580" : "#ff4800"
        };
    });

    return (
        <div className={classes.container}>
            <StateGraph stateGraph={{ nodes: graphNodes, links: graphLinks }} />
            <AdjacencyList adjacencyList={adjacencyList} />
        </div>
    );
}