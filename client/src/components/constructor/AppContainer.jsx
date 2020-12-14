import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Graph from './Graph';
import SystemProperties from './SystemProperties';
import ModuleGraphRules from './ModuleGraphRules';
import ValidatedJsonGraph from './ValidatedJsonGraph';

import { DepthFirstSearchTreeValidator } from "../../utils/graph/DepthFirstSearchTreeValidator";
import { TreeBuilder } from "../../utils/graph/TreeBuilder";
import { SequentialParallel } from "../../utils/graph/SequentialParallel";
import { startNodeId, endNodeId } from '../../utils/GraphData';
import { NODE_KEY } from '../../utils/GraphConfig';

import Alert from '@material-ui/lab/Alert';
import { connect } from 'react-redux';
import { setSystemScheme } from '../../redux/systemSchemeGraphSlice';
import { setAdjacencyList } from '../../redux/systemStateAdjacencyListSlice';
import { setInvestigationRequest } from '../../redux/investigationRequestSlice';

import { test } from "../../actions/api";

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


const validateModuleGraph = graph => {

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
        throw Error(`Модуль ${errorNode.title} повинен бути з'єднаним з іншими`)
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

const AppContainer = ({ currentGraph, setInvestigationRequest, setAdjacencyList, setSystemScheme }) => {

    const classes = useStyles();

    const [json, setJson] = useState(null);
    const [systemModules, setSystemModules] = React.useState([]);
    const [validationMessage, setValidationMessage] = useState(null);
    const [topLevelModule, setTopLevelModule] = useState(null);

    const investigate = async moduleRates => {

        setModuleRates(topLevelModule.members, moduleRates);

        const response = await test(topLevelModule);

        setInvestigationRequest(topLevelModule);
        setAdjacencyList(response);
    };

    const onSystemSchemeChanged = graph => {
        try {
            const treeNodes = validateModuleGraph(graph);

            const processor = new SequentialParallel();
            const startNode = processor.createComposite(treeNodes[0])

            setJson(startNode.getRepresentation());
            setValidationMessage(null);

            setSystemScheme(graph);

            setTopLevelModule(startNode.toRequest(graph.nodes));

        } catch (error) {
            setValidationMessage(error.message);
            setJson(null);
        }

        setSystemModules(graph.nodes
            .filter(node => node.id !== endNodeId && node.id !== startNodeId)
            .map((node, index) => ({ title: node.title, id: node.id, failureRate: (index + 1) * 0.0001, recoveryRate: (index + 1) * 0.01, left: 0 })));
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
                <div className={classes.drawerHeader}/>
                {validationMessage && <Alert severity="error">{validationMessage}</Alert>}
                <ValidatedJsonGraph json={json} />
            </Drawer>
            <main className={classes.content}>
                <div className={classes.drawerHeader} />
                <Graph
                    onChange={onSystemSchemeChanged}
                    value={currentGraph} />
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

const mapStateToProps = state => {
    return {
        currentGraph: state.systemSchemeGraph.systemScheme
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSystemScheme: graph => dispatch(setSystemScheme({ graph })),
        setAdjacencyList: list => dispatch(setAdjacencyList({ adjacencyList: list })),
        setInvestigationRequest: investigationRequest => dispatch(setInvestigationRequest({ investigationRequest }))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);