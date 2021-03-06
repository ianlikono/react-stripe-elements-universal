// @flow
import React from 'react';
import PropTypes from 'prop-types';
import type {StripeContext} from './Provider';

type Props = {
  children?: any,
};

export type ElementContext = {
  elements: ElementsShape,
  registerElement: (type: string, element: ElementShape) => void,
  unregisterElement: (element: ElementShape) => void,
};
export type FormContext = {
  registeredElements: Array<{type: string, element: ElementShape}>,
};
type ElementsContext = ElementContext & FormContext;

export default class Elements extends React.Component<Props, FormContext> {
  static childContextTypes = {
    elements: PropTypes.object,
    registerElement: PropTypes.func.isRequired,
    unregisterElement: PropTypes.func.isRequired,
    registeredElements: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        element: PropTypes.object.isRequired,
      })
    ).isRequired,
  };
  static contextTypes = {
    stripe: PropTypes.object,
  };
  static defaultProps = {
    children: null,
  };
  constructor(props: Props, context: StripeContext) {
    super(props, context);

    const {children, ...options} = this.props;

    // Stripe.js browser-only check
    if (typeof window === 'object') {
      this._elements = this.context.stripe.elements(options);
    }

    this.state = {
      registeredElements: [],
    };
  }

  getChildContext(): ElementsContext {
    return {
      elements: this._elements,
      registerElement: this.handleRegisterElement,
      unregisterElement: this.handleUnregisterElement,
      registeredElements: this.state.registeredElements,
    };
  }
  props: Props;
  context: StripeContext;
  _elements: ElementsShape;

  handleRegisterElement = (type: string, element: Object) => {
    this.setState(prevState => ({
      registeredElements: [...prevState.registeredElements, {type, element}],
    }));
  };

  handleUnregisterElement = (el: Object) => {
    this.setState(prevState => ({
      registeredElements: prevState.registeredElements.filter(
        ({element}) => element !== el
      ),
    }));
  };

  render() {
    return React.Children.only(this.props.children);
  }
}
