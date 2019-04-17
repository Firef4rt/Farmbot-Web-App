import React from "react";
import { t } from "../i18next_wrapper";
import {
  AlertCardProps, AlertCardTemplateProps, FirmwareMissingProps,
  SeedDataMissingProps, SeedDataMissingState, TourNotTakenProps,
  CommonAlertCardProps,
  DismissAlertProps
} from "./interfaces";
import { formatLogTime } from "../logs";
import {
  FirmwareActions
} from "../devices/components/fbos_settings/firmware_hardware_status";
import { DropDownItem, Row, Col, FBSelect, docLink } from "../ui";
import { Content } from "../constants";
import { TourList } from "../help/tour_list";
import { splitProblemTag } from "./alerts";
import { destroy } from "../api/crud";

export const AlertCard = (props: AlertCardProps) => {
  const { alert, timeSettings, findApiAlertById, dispatch } = props;
  const commonProps = { alert, timeSettings, findApiAlertById, dispatch };
  switch (alert.problem_tag) {
    case "farmbot_os.firmware.missing":
      return <FirmwareMissing {...commonProps}
        apiFirmwareValue={props.apiFirmwareValue} />;
    case "api.seed_data.missing":
      return <SeedDataMissing {...commonProps}
        dispatch={dispatch} />;
    case "api.tour.not_taken":
      return <TourNotTaken {...commonProps}
        dispatch={dispatch} />;
    case "api.user.not_welcomed":
      return <UserNotWelcomed {...commonProps} />;
    case "api.documentation.unread":
      return <DocumentationUnread {...commonProps} />;
    default:
      return UnknownAlert(commonProps);
  }
};
const dismissAlert = (props: DismissAlertProps) => () =>
  (props.id && props.findApiAlertById && props.dispatch)
    ? props.dispatch(destroy(props.findApiAlertById(props.id)))
    : () => { };

const AlertCardTemplate = (props: AlertCardTemplateProps) => {
  const { alert, findApiAlertById, dispatch } = props;
  return <div className={`problem-alert ${props.className}`}>
    <div className="problem-alert-title">
      <i className="fa fa-exclamation-triangle" />
      <h3>{t(props.title)}</h3>
      <p>{formatLogTime(alert.created_at, props.timeSettings)}</p>
      <i className="fa fa-times"
        onClick={dismissAlert({ id: alert.id, findApiAlertById, dispatch })} />
    </div>
    <div className="problem-alert-content">
      <p>{t(props.message)}</p>
      {props.children}
    </div>
  </div>;
};

const UnknownAlert = (props: CommonAlertCardProps) => {
  const { problem_tag, created_at, priority } = props.alert;
  const { author, noun, verb } = splitProblemTag(problem_tag);
  const createdAt = formatLogTime(created_at, props.timeSettings);
  return <AlertCardTemplate
    alert={props.alert}
    className={"unknown-alert"}
    title={`${t(noun)}: ${t(verb)} (${t(author)})`}
    message={t("Unknown problem of priority {{priority}} created at {{createdAt}}",
      { priority, createdAt })}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById} />;
};

const FirmwareMissing = (props: FirmwareMissingProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"firmware-missing-alert"}
    title={t("Firmware missing")}
    message={t("Your device has no firmware installed.")}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}>
    <FirmwareActions
      apiFirmwareValue={props.apiFirmwareValue}
      botOnline={true} />
  </AlertCardTemplate>;

const SEED_DATA_OPTIONS: DropDownItem[] = [
  { label: "Genesis v1.2", value: "12" },
  { label: "Genesis v1.3", value: "13" },
  { label: "Genesis v1.4", value: "14" },
  { label: "Genesis v1.4 XL", value: "14XL" },
  { label: "Custom Bot", value: "custom" },
];

class SeedDataMissing
  extends React.Component<SeedDataMissingProps, SeedDataMissingState> {
  state: SeedDataMissingState = { selection: "" };
  render() {
    return <AlertCardTemplate
      alert={this.props.alert}
      className={"seed-data-missing-alert"}
      title={t("Choose your FarmBot")}
      message={t(Content.SEED_DATA_SELECTION)}
      timeSettings={this.props.timeSettings}
      dispatch={this.props.dispatch}
      findApiAlertById={this.props.findApiAlertById}>
      <Row>
        <Col xs={4}>
          <label>{t("Choose your FarmBot")}</label>
        </Col>
        <Col xs={5}>
          <FBSelect
            key={this.state.selection}
            list={SEED_DATA_OPTIONS}
            selectedItem={SEED_DATA_OPTIONS[0]}
            onChange={() => { }} />
        </Col>
      </Row>
    </AlertCardTemplate>;
  }
}

const TourNotTaken = (props: TourNotTakenProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"tour-not-taken-alert"}
    title={t("Take a guided tour")}
    message={t(Content.TAKE_A_TOUR)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}>
    <p>{t("Choose a tour to begin")}:</p>
    <TourList dispatch={props.dispatch} />
  </AlertCardTemplate>;

const UserNotWelcomed = (props: CommonAlertCardProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"user-not-welcomed-alert"}
    title={t("Welcome to the FarmBot Web App")}
    message={t(Content.WELCOME)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}>
    <p>
      {t("You're currently viewing the")} <b>{t("Message Center")}</b>.
      &nbsp;{t(Content.MESSAGE_CENTER_WELCOME)}
    </p>
    <p>
      {t(Content.MESSAGE_DISMISS)}
    </p>
  </AlertCardTemplate>;

const DocumentationUnread = (props: CommonAlertCardProps) =>
  <AlertCardTemplate
    alert={props.alert}
    className={"documentation-unread-alert"}
    title={t("Learn more about the app")}
    message={t(Content.READ_THE_DOCS)}
    timeSettings={props.timeSettings}
    dispatch={props.dispatch}
    findApiAlertById={props.findApiAlertById}>
    <p>
      {t("Head over to")}
      &nbsp;<a href={docLink()} target="_blank"
        title={t("Open documentation in a new tab")}>
        {t("software.farm.bot")}
      </a>
      &nbsp;{t("to get started")}.
    </p>
    <a className="link-button fb-button green"
      href={docLink()} target="_blank"
      title={t("Open documentation in a new tab")}>
      {t("Read the docs")}
    </a>
  </AlertCardTemplate>;