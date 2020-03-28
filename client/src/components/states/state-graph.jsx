import React from 'react';
import { Graph } from "react-d3-graph";

const config = {
    "automaticRearrangeAfterDropNode": false,
    "collapsible": false,
    "directed": true,
    "focusAnimationDuration": 0.5,
    "focusZoom": 1,
    "height": 800,
    "highlightDegree": 1,
    "highlightOpacity": 1,
    "linkHighlightBehavior": true,
    "maxZoom": 8,
    "minZoom": 0.1,
    "nodeHighlightBehavior": true,
    "panAndZoom": true,
    "staticGraph": false,
    "staticGraphWithDragAndDrop": false,
    "width": 1270,
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
        "fontSize": 12,
        "fontWeight": "normal",
        "highlightColor": "red",
        "highlightFontSize": 12,
        "highlightFontWeight": "normal",
        "labelProperty": "label",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
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