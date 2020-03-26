import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SystemStateTransition from './system-state-transition';

const useStyles = makeStyles(theme => ({
    container: {
        marginTop: "48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start"
    }
}));

export default function AdjacencyList({ open, adjacencyList }) {
    const classes = useStyles();

    const states = adjacencyList.map((adj, index) => (
        <SystemStateTransition key={index} transition={adj} />
    ));

    if (!adjacencyList.length) {
        return (<div />);
    }

    return (
        <div className={classes.container}>
            {states}
        </div>
    );
}