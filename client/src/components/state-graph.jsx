import React from 'react';
import { Graph } from "react-d3-graph";

const data = {
    nodes: [{ id: "1(1) 1 1" }, { id: "0(1) 1 1" }, { id: "1(1) 0 1" }, { id: "1(1) 1 0" }],
    links: [{ source: "1(1) 1 1", target: "0(1) 1 1" }, { source: "1(1) 1 1", target: "1(1) 0 1" }, { source: "1(1) 1 1", target: "1(1) 1 0" }]
};

const config = {
    "automaticRearrangeAfterDropNode": false,
    "collapsible": false,
    "directed": true,
    "focusAnimationDuration": 0.5,
    "focusZoom": 1,
    "height": 1000,
    "highlightDegree": 1,
    "highlightOpacity": 1,
    "linkHighlightBehavior": true,
    "maxZoom": 8,
    "minZoom": 0.1,
    "nodeHighlightBehavior": true,
    "panAndZoom": true,
    "staticGraph": false,
    "staticGraphWithDragAndDrop": false,
    "width": 1400,
    "d3": {
        "alphaTarget": 0.05,
        "gravity": -400,
        "linkLength": 150,
        "linkStrength": 1,
        "disableLinkForce": false
    },
    "node": {
        "color": "#fff",
        "fontColor": "black",
        "fontSize": 12,
        "highlightFontSize": 12,
        "fontWeight": "normal",
        "highlightColor": "SAME",
        "highlightFontWeight": "normal",
        "highlightStrokeColor": "SAME",
        "highlightStrokeWidth": "SAME",
        "labelProperty": "stateName",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
        "size": 450,
        "strokeColor": "#16b580",
        "strokeWidth": 4,
        "svg": "",
        "symbolType": "circle"
    },
    "link": {
        "type": "CURVE_SMOOTH",
        "color": "#d3d3d3",
        "fontColor": "black",
        "fontSize": 8,
        "fontWeight": "normal",
        "highlightColor": "red",
        "highlightFontSize": 8,
        "highlightFontWeight": "normal",
        "labelProperty": "label",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": false,
        "semanticStrokeWidth": false,
        "strokeWidth": 2.5,
        "markerHeight": 6,
        "markerWidth": 6
    }
};

export default function StateGraph({ stateGraph }) {

    return (
        <Graph
            id="graph-id"
            data={stateGraph}
            config={config}/>
    );
}