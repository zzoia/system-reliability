import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SystemStateTransition from './system-state-transition';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    container: {
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        padding: "0 16px",
        minWidth: "300px"
    },
    title: {
        margin: "16px 0 0 16px"
    }
}));

export default function AdjacencyList({ adjacencyList }) {
    const classes = useStyles();

    if (!adjacencyList.length) {
        return (<div />);
    }

    const states = adjacencyList.map((adj, index) => (
        <SystemStateTransition key={index} transition={adj} />
    ));

    return (
        <div className={classes.container}>
            <Typography className={classes.title}>Список переходів станів</Typography>
            {states}
        </div>
    );
}