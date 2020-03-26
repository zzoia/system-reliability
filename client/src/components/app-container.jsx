import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Graph from './graph';
import SystemProperties from './system-properties';
import ModuleGraphRules from './module-graph-rules';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AdjacencyList from './adjacency-list';
import ValidatedJsonGraph from './validated-json-graph';

import { DepthFirstSearchTreeValidator } from "../utils/depth-first-search-tree-validator";
import { TreeBuilder } from "../utils/tree-builder";
import { SequentialParallel } from "../utils/sequential-parallel";
import { startNodeId, endNodeId } from '../utils/graph-data';
import { NODE_KEY } from '../utils/graph-config';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

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

    const [json, setJson] = useState(null);
    const [adjacencyList, setAdjacencyList] = React.useState([]);
    const [systemModules, setSystemModules] = React.useState([]);
    const [validationMessage, setValidationMessage] = useState(null);
    const [topLevelModule, setTopLevelModule] = useState(null);

    const setModuleRates = (validatedModules, moduleRates) => {
        validatedModules.forEach(validModule => {

            if (validModule.members.length) {

                setModuleRates(validModule.members, moduleRates);
            } else {

                const rates = moduleRates.find(rate => rate.id === validModule.id);
                validModule.failureRate = rates.failureRate;
                validModule.recoveryRate = rates.recoveryRate;
            }
        });
    };

    const investigate = async (moduleRates) => {

        setModuleRates(topLevelModule.members, moduleRates);
        console.log(topLevelModule)
        const response = await fetch("http://localhost:53294/systemreliability/test", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topLevelModule)
        });

        setAdjacencyList(await response.json());
    };

    const validateModuleGraph = (graph) => {

        const edges = graph.edges;
        if (edges.some(edge => edge.target === startNodeId || edge.source === endNodeId)) {
            throw Error("Існують ребра, які входять в початковий вузол або, які виходять із кінцевого");
        }

        const treeBuilder = new TreeBuilder();
        edges.forEach(edge => treeBuilder.fromEdge(edge));

        const nodes = graph.nodes;

        try {
            treeBuilder.validateDanglingNodes();
        } catch (error) {
            const errorNode = nodes.find(node => node[NODE_KEY] === error.id);
            throw Error(`Модуль ${errorNode.title} повинен бути з'єднаним з іншими.`)
        }

        const validator = new DepthFirstSearchTreeValidator(treeBuilder);
        const treeNodes = validator.validate();

        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            const currentNode = nodes[nodeIndex];
            if (!treeBuilder.hasNodeWithId(currentNode[NODE_KEY])) {
                throw Error(`Модуль ${currentNode.title} не з'єднаний: з'єднайте його або видаліть`);
            }
        }

        return treeNodes;
    }

    const showValidationResult = (graph) => {
        try {
            const treeNodes = validateModuleGraph(graph);

            const processor = new SequentialParallel();
            const startNode = processor.createComposite(treeNodes[0])

            setJson(startNode.getRepresentation());
            setValidationMessage(null);

            setTopLevelModule(startNode.toRequest(graph.nodes));

        } catch (error) {
            setValidationMessage(error.message);
            setJson(null);
        }

        setSystemModules(graph.nodes.filter(node => node.id !== endNodeId && node.id !== startNodeId));
    }

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar)}>
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            Reliability of System
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    anchor="left"
                    open={true}
                    classes={{
                        paper: classes.drawerPaper,
                    }}>
                    <div className={classes.drawerHeader}>
                    </div>
                    {validationMessage && <Alert severity="error">{validationMessage}</Alert>}
                    <ValidatedJsonGraph json={json} />
                </Drawer>
                <main className={clsx(classes.content)}>
                    <div className={classes.drawerHeader} />
                    <Graph onChange={showValidationResult} />
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
                    <ModuleGraphRules />
                    <SystemProperties
                        modules={systemModules}
                        onInvestigate={investigate} />
                </Drawer>
            </div >
        </ThemeProvider >
    );
}