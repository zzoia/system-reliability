import React, { useState } from 'react';
import AdjacencyList from './AdjacencyList';
import { makeStyles } from '@material-ui/core/styles';
import StateGraph from './StateGraph';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { connect } from 'react-redux';
import StringList from '../common/StringList';

const headerCompensation = 48;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        height: "100%"
    },
    content: {
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        paddingTop: headerCompensation
    },
    adjacencyList: {
        paddingTop: headerCompensation
    },
    checkbox: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(2)
    },
    container: {
        display: "flex",
        height: "inherit",
        alignItems: "stretch",
        marginTop: headerCompensation
    },
    settings: {
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        paddingTop: headerCompensation
    }
}));

const stateToIndex = state => state.index;

const stateToModules = state => {

    const modules = state.moduleStates;

    let result = ""
    modules.forEach(moduleState => {
        result += moduleState.isWorking ? "1" : "0";
        if (moduleState.left !== null) {
            result += `(${moduleState.left})`;
        }
    });
    return result;
};

export const statusToColor = status => {
    switch (status) {
        case "working":
            return "#16b580";
        case "waitingRecovery":
            return "#ebcf34";
        case "terminal":
            return "#ff4800";
        default:
            break;
    }
};

const getGraph = (adjacencyList, includeTerminal, descriptionFunc) => {

    const graphLinks = [];
    let graphNodes = adjacencyList.map(node => {
        const id = descriptionFunc(node.fromState);

        if (includeTerminal || node.fromState.status !== "terminal") {
            node.toStates.forEach(toState => {

                const label = toState.isRecovering ? `${toState.withRate}, μ` : `${toState.withRate}, λ`;

                graphLinks.push({
                    source: id,
                    target: descriptionFunc(toState.toState),
                    label
                });
            });
        }
        return {
            id,
            strokeColor: statusToColor(node.fromState.status),
            highlightColor: statusToColor(node.fromState.status)
        };
    });

    graphNodes = graphNodes.filter(node => graphLinks.some(link => link.source === node.id || link.target === node.id));

    if (graphNodes.length > 64) {
        return null;
    }

    return {
        nodes: graphNodes,
        links: graphLinks
    };
};

const ReliabilityModelContainer = ({ adjacencyList }) => {

    const classes = useStyles();

    const [includeTerminal, setIncludeTerminal] = useState(false);
    const [useIndex, setUseIndex] = useState(true);

    const [graphData, setGraphData] = useState(getGraph(adjacencyList, includeTerminal, stateToIndex));

    const getFunc = useIndex => useIndex ? stateToIndex : stateToModules;

    const handleGraphFilter = event => {
        const include = event.target.checked;
        setIncludeTerminal(include);

        setGraphData(getGraph(adjacencyList, include, getFunc(useIndex)))
    }

    const handleIndexDescription = event => {
        const useIndexValue = event.target.checked;
        setUseIndex(useIndexValue);

        setGraphData(getGraph(adjacencyList, includeTerminal, getFunc(useIndexValue)))
    }

    const explanations = [
        "В списку переходів станів знаходяться всі можливі стани системи",
        "Кожен стан складається з опис стану всіх підмодулів, з яких складається система",
        "Стан підмодуля починається з знаку + або -, який описує чи модуль працює, чи ні, відповідно",
        "Після знаку іде назва модуля з графу системи",
        "В дужках написано, скільки відновлень залишилось для підмодуля після відмови",
        "Якщо підмодуль не має дужок, він може відновлюватись безкінечно",
        "Зелена галочка біля стану означає, що система в такому стані працює, жовтий годинний - система може відновитись з цього стану, червоний хрестик - система не відновиться",
        "Кожен стан можна розгорнути і побачити наступні можливі стани, в які система може перейти з поточного стану в аналогічному форматі"
    ];

    return (
        <div className={classes.root}>
            <div className={classes.settings}>
                <FormControlLabel
                    className={classes.checkbox}
                    control={
                        <Checkbox
                            checked={includeTerminal}
                            onChange={handleGraphFilter}
                            color="primary"
                        />
                    }
                    label="Показувати переходи з непрацездатних станів"
                />
                <FormControlLabel
                    className={classes.checkbox}
                    control={
                        <Checkbox
                            checked={useIndex}
                            onChange={handleIndexDescription}
                            color="primary"
                        />
                    }
                    label="Позначати стани індексом, а не повним описом підмодулів"
                />
                <StringList items={explanations} />
            </div>
            <div className={classes.content}>
                <StateGraph stateGraph={graphData} />
            </div>
            <AdjacencyList
                className={classes.adjacencyList}
                adjacencyList={adjacencyList} />
        </div>
    );
};

const mapStateToProps = state => {
    return {
        adjacencyList: state.systemStateAdjacencyList
    }
};

export default connect(mapStateToProps)(ReliabilityModelContainer);