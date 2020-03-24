import * as React from 'react';

import { GraphView } from 'react-digraph';

import GraphConfig, {
    EMPTY_EDGE_TYPE,
    NODE_KEY,
    SKINNY_TYPE,
} from '../utils/graph-config';

import { DefaultSystemGarph, startNodeId, endNodeId, romanize } from '../utils/graph-data';

import { DepthFirstSearchTreeValidator } from "../utils/depth-first-search-tree-validator";
import { TreeBuilder } from "../utils/tree-builder";
import { SequentialParallel } from "../utils/sequential-parallel";

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

class Graph extends React.Component {
    GraphView;

    constructor(props) {
        super(props);

        this.state = {
            copiedNode: null,
            graph: DefaultSystemGarph,
            selected: null,
            snackbar: null
        };

        this.GraphView = React.createRef();
    }

    // Helper to find the index of a given node
    getNodeIndex(searchNode) {
        return this.state.graph.nodes.findIndex(node => {
            return node[NODE_KEY] === searchNode[NODE_KEY];
        });
    }

    // Helper to find the index of a given edge
    getEdgeIndex(searchEdge) {
        return this.state.graph.edges.findIndex(edge => {
            return (
                edge.source === searchEdge.source && edge.target === searchEdge.target
            );
        });
    }

    // Given a nodeKey, return the corresponding node
    getViewNode(nodeKey) {
        const searchNode = {};

        searchNode[NODE_KEY] = nodeKey;
        const i = this.getNodeIndex(searchNode);

        return this.state.graph.nodes[i];
    }

    // Called by 'drag' handler, etc..
    // to sync updates from D3 with the graph
    onUpdateNode = (viewNode) => {
        const graph = this.state.graph;
        const i = this.getNodeIndex(viewNode);

        graph.nodes[i] = viewNode;
        this.setState({ graph });
    };

    // Node 'mouseUp' handler
    onSelectNode = (viewNode) => {
        // Deselect events will send Null viewNode
        this.setState({ selected: viewNode });
    };

    // Edge 'mouseUp' handler
    onSelectEdge = (viewEdge) => {
        this.setState({ selected: viewEdge });
    };

    // Updates the graph with a new node
    onCreateNode = (x, y) => {
        const graph = this.state.graph;

        const ids = graph.nodes.filter(n => !isNaN(n.id)).map(n => n.id);
        const newId = Math.max(...ids) + 1;

        const viewNode = {
            id: newId,
            title: romanize(newId),
            type: SKINNY_TYPE,
            x,
            y,
        };

        graph.nodes = [...graph.nodes, viewNode];
        this.setState({ graph });
    };

    // Deletes a node from the graph
    onDeleteNode = (viewNode, nodeId, nodeArr) => {
        const graph = this.state.graph;
        // Delete any connected edges
        const newEdges = graph.edges.filter((edge, i) => {
            return (
                edge.source !== viewNode[NODE_KEY] && edge.target !== viewNode[NODE_KEY]
            );
        });

        graph.nodes = nodeArr;
        graph.edges = newEdges;

        this.setState({ graph, selected: null });
    };

    // Creates a new node between two edges
    onCreateEdge = (sourceViewNode, targetViewNode) => {

        const viewEdge = {
            source: sourceViewNode[NODE_KEY],
            target: targetViewNode[NODE_KEY],
            EMPTY_EDGE_TYPE,
        };

        const graph = this.state.graph;

        if (viewEdge.source !== viewEdge.target) {
            graph.edges = [...graph.edges, viewEdge];
            this.setState({
                graph,
                selected: viewEdge,
            });
        }
    };

    // Called when an edge is reattached to a different target.
    onSwapEdge = (
        sourceViewNode,
        targetViewNode,
        viewEdge
    ) => {
        const graph = this.state.graph;
        const i = this.getEdgeIndex(viewEdge);
        const edge = JSON.parse(JSON.stringify(graph.edges[i]));

        edge.source = sourceViewNode[NODE_KEY];
        edge.target = targetViewNode[NODE_KEY];
        graph.edges[i] = edge;
        // reassign the array reference if you want the graph to re-render a swapped edge
        graph.edges = [...graph.edges];

        this.setState({
            graph,
            selected: edge,
        });
    };

    // Called when an edge is deleted
    onDeleteEdge = (viewEdge, edges) => {
        const graph = this.state.graph;

        graph.edges = edges;
        this.setState({
            graph,
            selected: null,
        });
    };

    onUndo = () => {
        console.warn('Undo is not currently implemented in the example.');
    };

    onCopySelected = () => {
        if (this.state.selected.source) {
            console.warn('Cannot copy selected edges, try selecting a node instead.');

            return;
        }

        const x = this.state.selected.x + 10;
        const y = this.state.selected.y + 10;

        this.setState({
            copiedNode: { ...this.state.selected, x, y },
        });
    };

    onPasteSelected = () => {
        if (!this.state.copiedNode) {
            console.warn(
                'No node is currently in the copy queue. Try selecting a node and copying it with Ctrl/Command-C'
            );
        }

        const graph = this.state.graph;
        const newNode = { ...this.state.copiedNode, id: Date.now() };

        graph.nodes = [...graph.nodes, newNode];
        this.forceUpdate();
    };

    canDeleteNode = (node) => node[NODE_KEY] !== startNodeId && node[NODE_KEY] !== endNodeId;

    validateModuleGraph = () => {
        const edges = this.state.graph.edges;
        if (edges.some(edge => edge.target === startNodeId || edge.source === endNodeId)) {
            throw Error("Існують ребра, які входять в початковий вузол або, які виходять із кінцевого");
        }

        const treeBuilder = new TreeBuilder();

        edges.forEach(edge => treeBuilder.fromEdge(edge));

        const validator = new DepthFirstSearchTreeValidator(treeBuilder);
        const treeNodes = validator.validate();

        const nodes = this.state.graph.nodes;
        nodes.forEach(node => {
            if (!treeNodes.some(treeNode => treeNode.id === node[NODE_KEY])) {
                throw Error("Не всі вершини з'єднані: з'єднайте їх або видаліть");
            }
        });

        return treeNodes;
    }

    showValidationResult = () => {
        try {
            const treeNodes = this.validateModuleGraph();

            const processor = new SequentialParallel();
            const startNode = processor.createComposite(treeNodes[0])

            this.props.onValidated(startNode.getRepresentation());

        } catch (error) {
            this.setState({
                snackbar: {
                    success: false,
                    message: error.message
                }
            });

            this.props.onValidated(null);
        }
    }

    handleClose = () => {
        this.setState({ snackbar: null });
    }

    render() {
        const { nodes, edges } = this.state.graph;
        const selected = this.state.selected;
        const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

        return (
            <div id="graph">
                <div className="graph-header">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.showValidationResult}>{"Перевірити & Формалізувати"}</Button>
                </div>
                <GraphView
                    ref={el => (this.GraphView = el)}
                    nodeKey={NODE_KEY}
                    nodes={nodes}
                    edges={edges}
                    selected={selected}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    canDeleteNode={this.canDeleteNode}
                    onSelectNode={this.onSelectNode}
                    onCreateNode={this.onCreateNode}
                    onUpdateNode={this.onUpdateNode}
                    onDeleteNode={this.onDeleteNode}
                    onSelectEdge={this.onSelectEdge}
                    onCreateEdge={this.onCreateEdge}
                    onSwapEdge={this.onSwapEdge}
                    onDeleteEdge={this.onDeleteEdge}
                    showGraphControls={true}
                    onUndo={this.onUndo}
                    onCopySelected={this.onCopySelected}
                    onPasteSelected={this.onPasteSelected}
                    layoutEngineType="SnapToGrid"
                />
                <Snackbar
                    open={!!this.state.snackbar}
                    autoHideDuration={6000}
                    onClose={this.handleClose}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}>

                    <Alert
                        elevation={6}
                        variant="filled"
                        onClose={this.handleClose}
                        severity={this.state.snackbar?.success ? "success" : "error"}>

                        {this.state.snackbar?.message}
                    </Alert>

                </Snackbar>
            </div>
        );
    }
}

export default Graph;
