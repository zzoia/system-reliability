import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CardContent, Card } from '@material-ui/core';
import { statusToColor } from '../states/ReliabilityModelContainer'
import EquationRightSide from './EquationRightSide';
import { connect } from 'react-redux';
import { getEquationSystem } from "../../actions/apiActions";

const useStyles = makeStyles(theme => ({
    container: {
        paddingLeft: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        background: "#f9f9f9",
        height: "inherit",
        alignItems: "center",
        marginTop: "48px"
    },
    system: {
        display: "flex"
    },
    leftSide: {
        display: "flex",
        flexDirection: "column"
    },
    leftSideBar: {
        flexShrink: 0,
        maxHeight: "800px",
        overflow: "auto"
    },
    leftSideState: {
        height: "30px",
        textAlign: "center"
    },
    coefficients: {
        marginLeft: theme.spacing(2),
        overflow: "auto",
        maxWidth: "1000px"
    }
}));

const EquationSystemContainer = ({ systemRequest }) => {

    const classes = useStyles();

    const [states, setStates] = useState([]);
    const [coeffs, setCoeffs] = useState([]);

    const getEquation = async () => {
        const data = await getEquationSystem(systemRequest);
        setStates(data.systemStates);
        setCoeffs(data.coefficients)
    };

    useEffect(() => {
        getEquation();
    }, [systemRequest]);

    return (
        <div className={classes.container}>
            <div className={classes.system}>
                <Card>
                    <CardContent>
                        <div className={classes.leftSide}>
                            {
                                states.map((state, index) => (
                                    <div
                                        key={index}
                                        className={classes.leftSideState}
                                        style={{ color: statusToColor(state.status) }}>P{index + 1}(t)/dt</div>
                                ))
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card className={classes.coefficients}>
                    <CardContent>
                        {coeffs.map((equationCoeffs, index) => (<EquationRightSide coeffs={equationCoeffs} key={index} />))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const mapStateToProps = function (state) {
    return {
        systemRequest: state.investigationRequest
    }
};

export default connect(mapStateToProps)(EquationSystemContainer);