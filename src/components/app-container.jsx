import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Graph from './graph';
import ModuleGraphRules from './module-graph-rules';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import SystemJsonView from './system-json-view';

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#4b9fea',
            main: '#1e88e5',
            dark: '#155fa0',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff669a',
            main: '#ff4081',
            dark: '#b22c5a',
            contrastText: '#fff',
        },
    },
});

const drawerWidth = 400;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        height: "100%"
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        })
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0
    }
}));

export default function AppContainer() {

    const classes = useStyles();

    const [json, setJson] = useState(0);

    const [open, setOpen] = React.useState(false);

    const openJsonView = (json) => {
        if (!json) {
            setOpen(false);
        } else {
            setJson(json);
            setOpen(true);
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                        [classes.appBarShift]: open,
                    })}>
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            Reliability of System
                        </Typography>
                    </Toolbar>
                </AppBar>
                <SystemJsonView open={open} json={json} />
                <main className={clsx(classes.content)}>
                    <div className={classes.drawerHeader} />
                    <Graph onValidated={openJsonView} />
                </main>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    anchor="right"
                    open={true}
                    classes={{
                        paper: classes.drawerPaper,
                    }}>
                    <div className={classes.drawerHeader}>
                    </div>
                    <Divider />
                    <ModuleGraphRules />
                    <Divider />
                </Drawer>
            </div>
        </ThemeProvider>
    );
}