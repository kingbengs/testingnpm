import React, { Component } from 'react';
import PropTypes from "prop-types";
import onClickOutside from "react-onclickoutside";

class ClickOutsideCustom extends Component {
    handleClickOutside = (e) => {
        if (this.props.ignoreClickOutside) {
            return;
        }

        this.props.onClickOutside(e);
    }

    render() {
        return (this.props.children);
    }
}

ClickOutsideCustom.propTypes = {
    onClickOutside: PropTypes.func.isRequired,
    ignoreClickOutside: PropTypes.bool
};

export const ClickOutsideCustomComponent = onClickOutside(ClickOutsideCustom);
