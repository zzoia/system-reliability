import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Graph from './Graph';
import SystemProperties from './SystemProperties';
import StringList from '../common/StringList';

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

import { test } from "../../actions/apiActions";
import { download, readJson } from "../../actions/fileActions";
import { getGraphData } from "../../actions/dataUtils";
import { FilePicker } from './FilePicker';

const drawerWidth = 462;
const headerCompensation = 58;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        height: "100%"
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        paddingTop: headerCompensation
    },
    content: {
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        paddingTop: headerCompensation
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

    treeBuilder.validateMissingNodes(nodes);

    const validator = new DepthFirstSearchTreeValidator(treeBuilder);
    const treeNodes = validator.validate();

    return treeNodes;
};

export const processAndValidateGraph = graph => {
    const data = getGraphData(graph);
    const treeNodes = validateModuleGraph(data);
    const processor = new SequentialParallel();
    return processor.createComposite(treeNodes[0]);
}

const AppContainer = ({ currentGraph, setInvestigationRequest, setAdjacencyList, setSystemScheme }) => {

    const classes = useStyles();

    const [systemModules, setSystemModules] = React.useState([]);
    const [validationMessage, setValidationMessage] = useState(null);
    const [topLevelModule, setTopLevelModule] = useState(null);

    const onLoadGraphFromFile = async file => {
        const json = await readJson(file);
        setSystemScheme(json);
        window.location.reload();
    }

    const investigate = async moduleRates => {

        download(currentGraph, "graph.json");
        setModuleRates(topLevelModule.members, moduleRates);

        const response = await test(topLevelModule);

        setInvestigationRequest(topLevelModule);
        setAdjacencyList(response);
    };

    const onSystemSchemeChanged = graph => {
        try {
            const startNode = processAndValidateGraph(graph);

            setValidationMessage(null);

            setSystemScheme(graph);

            setTopLevelModule(startNode.toRequest(graph.nodes));

        } catch (error) {
            setValidationMessage(error.message);
        }

        const getRate = multiplier => {
            const items = [1, 2, 4, 8];
            const index = Math.floor(Math.random() * items.length);
            return items[index] * multiplier;
        };

        setSystemModules(graph.nodes
            .filter(node => node.id !== endNodeId && node.id !== startNodeId)
            .map(node => ({ title: node.title, id: node.id, failureRate: getRate(0.0001), recoveryRate: getRate(0.001), left: 0 })));
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

    const rules = [
        "Щоб додати модулі, натисніть Shift і клацніть на сітці",
        "Щоб додати переходи, затисніть Shift і почніть тягнути мишею від одного модуля до іншого",
        "Щоб видалити перехід чи модуль, виберіть його за допомогою миші і натисність Delete",
        "Перетягуйте мишею об'єкти, щоб змінити їх положення",
        "Використовуйте 'Завантажити граф', щоб відтворити раніше створений граф, який автоматично завантажується в файл при дослідженні системи",
        "Щоб підмодуль мав змогу відновлюватись безкінечно, в полі 'Оновлення' оберіть -1"
    ];

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Drawer
                className={classes.drawer}
                variant="permanent"
                anchor="left"
                open={true}
                classes={{
                    paper: classes.drawerPaper,
                }}>
                <SystemProperties
                    modules={systemModules}
                    onInvestigate={investigate} />
            </Drawer>
            <main className={classes.content}>
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
                <StringList items={rules} />
                <FilePicker onUploaded={onLoadGraphFromFile} />
                {validationMessage && <Alert severity="error">{validationMessage}</Alert>}
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