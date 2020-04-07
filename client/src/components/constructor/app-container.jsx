import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Graph from './graph';
import SystemProperties from './system-properties';
import ModuleGraphRules from './module-graph-rules';
import ValidatedJsonGraph from './validated-json-graph';

import { DepthFirstSearchTreeValidator } from "../../utils/depth-first-search-tree-validator";
import { TreeBuilder } from "../../utils/tree-builder";
import { SequentialParallel } from "../../utils/sequential-parallel";
import { startNodeId, endNodeId } from '../../utils/graph-data';
import { NODE_KEY } from '../../utils/graph-config';

import Alert from '@material-ui/lab/Alert';
import { connect } from 'react-redux';
import LocalStorageManager from '../../utils/local-storage-manager';
import { setSystemScheme } from '../../redux/system-scheme-graph-slice';
import { setAdjacencyList } from '../../redux/system-state-adjacency-list-slice';
import { setInvestigationRequest } from '../../redux/investigation-request-slice';

const drawerWidth = 462;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        height: "100%"
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
    drawerJson: {
        width: "400px",
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerPaperJson: {
        width: "400px"
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        height: "48px",
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

function AppContainer(props) {

    const classes = useStyles();

    const [json, setJson] = useState(null);
    const [systemModules, setSystemModules] = React.useState([]);
    const [validationMessage, setValidationMessage] = useState(null);
    const [topLevelModule, setTopLevelModule] = useState(null);

    const [currentSystemGraph, setCurrentSystemGraph] = useState(props.currentGraph);

    const investigate = async (moduleRates) => {

        setModuleRates(topLevelModule.members, moduleRates);

        const request = JSON.stringify(topLevelModule);
        const response = await fetch("http://localhost:53294/systemreliability/test", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: request
        });

        props.setInvestigationRequest(topLevelModule);
        props.setAdjacencyList(await response.json());
    };

    const onSystemSchemeChanged = (graph) => {
        try {
            const treeNodes = validateModuleGraph(graph);

            const processor = new SequentialParallel();
            const startNode = processor.createComposite(treeNodes[0])

            setJson(startNode.getRepresentation());
            setValidationMessage(null);

            props.setSystemScheme(graph);

            setTopLevelModule(startNode.toRequest(graph.nodes));

        } catch (error) {
            setValidationMessage(error.message);
            setJson(null);
        }

        setSystemModules(graph.nodes
            .filter(node => node.id !== endNodeId && node.id !== startNodeId)
            .map((node, index) => ({ title: node.title, id: node.id, failureRate: (index + 1) * 0.0001, recoveryRate: (index + 1) * 0.01, left: 0 })));
    }

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
    };

    const setModuleRates = (validatedModules, moduleRates) => {
        validatedModules.forEach(validModule => {

            if (validModule.members.length) {

                setModuleRates(validModule.members, moduleRates);
            } else {

                const rates = moduleRates.find(rate => rate.id === validModule.id);
                validModule.failureRate = +rates.failureRate;
                validModule.recoveryRate = +rates.recoveryRate;
                validModule.left = +rates.left;
            }
        });
    };

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Drawer
                className={classes.drawerJson}
                variant="permanent"
                anchor="left"
                open={true}
                classes={{
                    paper: classes.drawerPaperJson,
                }}>
                <div className={classes.drawerHeader}>
                </div>
                {validationMessage && <Alert severity="error">{validationMessage}</Alert>}
                <ValidatedJsonGraph json={json} />
            </Drawer>
            <main className={clsx(classes.content)}>
                <div className={classes.drawerHeader} />
                <Graph
                    onChange={onSystemSchemeChanged}
                    value={currentSystemGraph} />
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
    );
};

const mapStateToProps = function (state) {
    return {
        currentGraph: state.systemSchemeGraph.systemScheme
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSystemScheme: (graph) => dispatch(setSystemScheme({ graph })),
        setAdjacencyList: (list) => dispatch(setAdjacencyList({ adjacencyList: list })),
        setInvestigationRequest: (investigationRequest) => dispatch(setInvestigationRequest({ investigationRequest }))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);