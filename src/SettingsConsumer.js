import React, { PureComponent } from "react";
import { bool, arrayOf, oneOfType, func, string } from "prop-types";
import { isNil, map, mergeAll, pipe } from "ramda";

export const settingsConsumerPropTypes = {
  /** App name(s), formatted as 'vendor.app', or ['vendor.app'] */
  app: oneOfType([arrayOf(string), string]).isRequired,
  /** If the settings should be merged into the returned object instead of each having it's own key */
  merge: bool,
  /** Render prop function */
  children: func.isRequired
};

/**
 * Finds settings from VTEX IO for the app, and if they don't exist,
 * returns an empty object
 */
export class SettingsConsumer extends React.PureComponent {
  getSettings = app => ({ [app]: this.context.getSettings(app) || {} });
  getAllSettings = pipe(
    map(this.getSettings),
    mergeAll
  );
  mergeAllProps = o => Object.values(o).reduce((p, c) => ({ ...p, ...c }), {});

  render() {
    const { app, merge, children } = this.props;
    const apps = typeof app === "string" ? [app] : app;
    const shouldMerge = isNil(merge) ? apps.length === 1 : merge;

    const allSettings = this.getAllSettings(apps);
    const settings = shouldMerge
      ? this.mergeAllProps(allSettings)
      : allSettings;

    return children(settings);
  }

  static contextTypes = { getSettings: func };
  static propTypes = settingsConsumerPropTypes;
}

export const withSettings = props => Component =>
  class extends PureComponent {
    render() {
      return (
        <Consumer {...props}>
          {settings => <Component {...{ ...this.props, settings }} />}
        </Consumer>
      );
    }
  };

export default SettingsConsumer;
