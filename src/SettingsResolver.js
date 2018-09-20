import React, { PureComponent } from "react";
import { oneOf, object, func } from "prop-types";
import {
  SettingsConsumer,
  settingsConsumerPropTypes
} from "./SettingsConsumer";

/**
 * Finds settings from VTEX IO for the app and merges them with the provided
 * settings via props, resolving any conflicts
 */
export class SettingsResolver extends PureComponent {
  mergeSettings = ({ prefer, settings, settingsProp }) =>
    prefer === "settings"
      ? { ...settingsProp, ...settings }
      : { ...settings, ...settingsProp };

  render() {
    const { app, merge, children, settingsProp, prefer, resolver } = this.props;

    return (
      <SettingsConsumer {...{ app, merge }}>
        {settings => {
          if (resolver) return resolver({ settings, ...this.props });

          const resolvedSettings = this.mergeSettings({
            prefer,
            settings,
            settingsProp
          });

          return children(resolvedSettings);
        }}
      </SettingsConsumer>
    );
  }

  static defaultProps = { prefer: "settings" };
  static contextTypes = { getSettings: func };
  static propTypes = {
    ...settingsConsumerPropTypes,
    /** Defines what should have priority when merging the settings */
    prefer: oneOf(["settings", "props"]),
    /** The object containing your props that serve as settings */
    settingsProp: object.isRequired,
    /** With this function you can override the settings resolver function */
    resolver: func
  };
}

export default SettingsResolver;
