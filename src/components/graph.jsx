import * as React from 'react';

import {
    GraphView
} from 'react-digraph';

import GraphConfig, {
    EMPTY_EDGE_TYPE,
    FORK_JOIN_NODE,
    NODE_KEY,
    SPECIAL_TYPE,
    SKINNY_TYPE,
} from './graph-config';

import * as Tree from './tree';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

const startNodeId = "start";
const endNodeId = "end";

const sample = {
    edges: [
        {
            source: startNodeId,
            target: 'm1',
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: startNodeId,
            target: 'm3',
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: startNodeId,
            target: 'm5',
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 'm1',
            target: 'm2',
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 'm3',
            target: 'm4',
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 'm5',
            target: 'm6',
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 'm2',
            target: endNodeId,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 'm4',
            target: endNodeId,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 'm6',
            target: endNodeId,
            type: EMPTY_EDGE_TYPE,
        }
    ],
    nodes: [
        {
            id: startNodeId,
            title: "Fork",
            x: 50,
            y: 200,
            type: FORK_JOIN_NODE
        },
        {
            id: 'm1',
            title: 'I',
            type: SKINNY_TYPE,
            x: 250,
            y: 100,
        },
        {
            id: 'm2',
            title: 'II',
            type: SKINNY_TYPE,
            x: 500,
            y: 100,
        },
        {
            id: 'm3',
            title: 'III',
            type: SKINNY_TYPE,
            x: 250,
            y: 200,
        },
        {
            id: 'm4',
            title: 'IV',
            type: SKINNY_TYPE,
            x: 500,
            y: 200,
        },
        {
            id: 'm5',
            title: 'V',
            type: SKINNY_TYPE,
            x: 250,
            y: 300,
        },
        {
            id: 'm6',
            title: 'VI',
            type: SKINNY_TYPE,
            x: 500,
            y: 300,
        },
        {
            id: endNodeId,
            title: "Join",
            x: 700,
            y: 200,
            type: FORK_JOIN_NODE
        }
    ],
};

class Graph extends React.Component {
    GraphView;

    constructor(props) {
        super(props);

        this.state = {
            copiedNode: null,
            graph: sample,
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

        const viewNode = {
            id: Date.now(),
            title: '',
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
        // Not implemented
        console.warn('Undo is not currently implemented in the example.');
        // Normally any add, remove, or update would record the action in an array.
        // In order to undo it one would simply call the inverse of the action performed. For instance, if someone
        // called onDeleteEdge with (viewEdge, i, edges) then an undelete would be a splicing the original viewEdge
        // into the edges array at position i.
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
            throw Error("Cannot have edges entering start node or going from end node.");
        }

        const treeBuilder = new Tree.TreeBuilder();

        edges.filter(edge => edge.target !== endNodeId)
            .forEach(edge => treeBuilder.fromEdge(edge));

        const validator = new Tree.DepthFirstSearchTreeValidator(treeBuilder);
        const treeNodes = validator.validate();

        const nodes = this.state.graph.nodes.filter(node => node[NODE_KEY] !== endNodeId);
        nodes.forEach(node => {
            if (!treeNodes.some(treeNode => treeNode.collection[0].id === node[NODE_KEY])) {
                throw Error("Not all nodes are connected.");
            }
        });

        const lastModule = new Tree.ModuleCollection("and", [new Tree.SingleModule(endNodeId)])
        treeNodes.filter(node => !node.children.length).forEach(node => {
            if (!edges.some(edge => edge.source === node.collection[0].id && edge.target === endNodeId)) {
                throw new Error("Not all leafs are connected to end node.");
            }

            node.children.push(lastModule);
            lastModule.parents.push(node);
        });

        treeNodes.push(lastModule);
        return treeNodes;
    }

    mergeParallel = (subModule) => {

        subModule.isVisitedByMergeSequantial = false;
        if (subModule.isVisitedByMergeParallel) return;
        subModule.isVisitedByMergeParallel = true;

        const children = subModule.children;
        if (children.length <= 1) {
            return;
        }

        if (children.length === 1) {
            this.mergeParallel(subModule.children[0]);
            return;
        }

        let commonGrandChildren = [];
        children.forEach((child, childIndex) => {
            if (child.children.length === 1) {
                const onlyChild = child.children[0];
                const found = commonGrandChildren.find(common => common.grandChild.equalsTo(onlyChild));

                if (found) {
                    found.childIndices.push(childIndex);
                } else {
                    commonGrandChildren.push({
                        childIndices: [childIndex],
                        grandChild: onlyChild
                    });
                }
            }
        });

        commonGrandChildren = commonGrandChildren.filter(common => common.childIndices.length > 1);
        if (commonGrandChildren.length) {

            commonGrandChildren.forEach(common => {

                const childrenToMerge = common.childIndices.map(index => {
                    const currentChild = children[index];

                    currentChild.parents = [];
                    currentChild.children = [];

                    subModule.children = subModule.children.filter(child => !child.equalsTo(currentChild));
                    common.grandChild.parents = common.grandChild.parents.filter(parent => !parent.equalsTo(currentChild));

                    return currentChild;
                });

                const newModule = new Tree.ModuleCollection("or", childrenToMerge);
                newModule.children = [common.grandChild];
                newModule.parents = [subModule];

                subModule.children.push(newModule);
                common.grandChild.parents.push(newModule);

                this.mergeParallel(common.grandChild);
            });

        } else {

            children.forEach(child => this.mergeParallel(child));
        }
    }

    hasOneChildWithOneParent(subModule) {
        return subModule.children.length === 1 && subModule.children[0].parents.length === 1;
    }

    mergeSequential = (subModule) => {

        subModule.isVisitedByMergeParallel = false;
        if (subModule.isVisitedByMergeSequantial) return;
        subModule.isVisitedByMergeSequantial = true;

        if (!subModule.children.length) {
            if (subModule.collection[0].id !== endNodeId) {
                throw Error("Childless module is not ending module.")
            }

            return;
        }

        while (this.hasOneChildWithOneParent(subModule)) {

            const child = subModule.children[0];
            //const andSubSystem = new Tree.ModuleCollection("and", [subModule, child])
            subModule.collection.push(child);

            subModule.children = [];

            child.children.forEach(grandChild => {
                subModule.children.push(grandChild);

                grandChild.parents = grandChild.parents.filter(par => !par.equalsTo(child));
                grandChild.parents.push(subModule);
            });

            child.children = [];
            child.parents = [];
        }

        subModule.children.forEach(child => {
            this.mergeSequential(child);
        });

    }

    showValidationResult = () => {
        // try {
        const treeNodes = this.validateModuleGraph();
        const startNode = treeNodes[0];

        do {
            this.mergeSequential(startNode);
            this.mergeParallel(startNode);
        } while (startNode.children.length);

        console.log(startNode.getRepresentation());
        // } catch (error) {
        //     this.setState({
        //         snackbar: {
        //             success: false,
        //             message: error.message
        //         }
        //     });
        // }
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
                        onClick={this.showValidationResult}>Investigate reliability</Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={this.showValidationResult}>{"Validate & Formalize"}</Button>
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
