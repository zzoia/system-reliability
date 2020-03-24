import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import SystemStateTransition from './system-state-transition';

const drawerWidth = 420;

const useStyles = makeStyles(theme => ({
    drawer: {
        flexShrink: 0
    },
    drawerPaper: {
        width: drawerWidth
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start'
    }
}));

export default function AdjacencyList({ open, adjacencyList }) {
    const classes = useStyles();

    const states = adjacencyList.map((adj, index) => (
        <SystemStateTransition key={index} transition={adj} />
    ));

    return (
        <Drawer
            className={classes.drawer}
            style={{ width: ((open) ? drawerWidth : 0) }}
            variant="persistent"
            anchor="left"
            open={open}
            classes={{
                paper: classes.drawerPaper,
            }}>
            <div className={classes.drawerHeader}>
            </div>
            {states}
        </Drawer>
    );
}